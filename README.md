# Aircraft Simulator - Tactical Placement Tool

A web-based simulation tool for interactive aircraft placement and algorithmic distribution across predefined positions. **Uses synthetic data only** - do NOT use with real military data.

## Quick Start (Frontend Only)

The React frontend runs directly in Lovable. For the full-stack experience with authentication and persistence, follow the Docker Compose setup below.

## Features

### Map View (`/`)
- Interactive satellite/terrain map using Leaflet (free, no API key)
- Replaceable tile layer (OSM, CartoDB, ESRI Satellite, custom URL)
- Position markers showing capacity status (color-coded)
- Side panel for position details and aircraft assignment
- Aircraft palette with drag-and-drop support
- Manual and automatic placement modes

### Admin Table (`/admin/table`)
- Spreadsheet-like view of all positions grouped by base
- Inline editing for notes
- CSV import/export
- Click-to-remove aircraft assignments

### Placement Algorithms
1. **Spread Evenly**: Distributes aircraft as evenly as possible across positions
2. **Cluster**: Concentrates aircraft in fewest positions (fill first)
3. **Minimize Distance**: Greedy assignment minimizing movement from home positions

## Role-Based Access

- **Admin**: Can assign/unassign aircraft, run algorithms, edit table, import/export
- **Viewer**: Can view map and data only (read-only)

Toggle between roles using the user dropdown in the header.

---

## Full-Stack Setup (Docker Compose)

For persistence and Keycloak authentication, deploy the backend separately.

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Docker Compose Setup

Create these files in a `backend/` directory alongside this frontend:

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=sim
      - KC_DB_PASSWORD=${POSTGRES_PASSWORD:-sim}
    command: start-dev --import-realm
    volumes:
      - ./keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: sim
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-sim}
      POSTGRES_DB: simdb
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sim -d simdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://sim:${POSTGRES_PASSWORD:-sim}@postgres:5432/simdb
      KEYCLOAK_ISSUER: http://keycloak:8080/realms/sim-realm
      KEYCLOAK_CLIENT_ID: sim-app
      NODE_ENV: development
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - keycloak

volumes:
  pgdata:
```

#### `init.sql` (PostgreSQL schema)

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bases table
CREATE TABLE IF NOT EXISTS bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_id UUID REFERENCES bases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hardpoint', 'hangar', 'apron', 'runway')),
    capacity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('fighter', 'bomber', 'transport', 'recon', 'helicopter')),
    callsign VARCHAR(50) NOT NULL UNIQUE,
    size VARCHAR(20) NOT NULL CHECK (size IN ('small', 'medium', 'large')),
    status VARCHAR(50) NOT NULL DEFAULT 'unassigned' CHECK (status IN ('assigned', 'unassigned', 'maintenance', 'deployed')),
    assigned_position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    home_latitude DECIMAL(10, 6),
    home_longitude DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_positions_base_id ON positions(base_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_position ON aircraft(assigned_position_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
```

#### `keycloak/realm-export.json` (Keycloak realm config)

```json
{
  "realm": "sim-realm",
  "enabled": true,
  "clients": [
    {
      "clientId": "sim-app",
      "enabled": true,
      "publicClient": true,
      "redirectUris": ["http://localhost:3000/*", "http://localhost:8080/*"],
      "webOrigins": ["*"],
      "directAccessGrantsEnabled": true
    }
  ],
  "roles": {
    "realm": [
      { "name": "admin", "description": "Administrator with full access" },
      { "name": "viewer", "description": "Read-only access" }
    ]
  },
  "users": [
    {
      "username": "admin",
      "enabled": true,
      "credentials": [{ "type": "password", "value": "admin", "temporary": false }],
      "realmRoles": ["admin"]
    },
    {
      "username": "viewer",
      "enabled": true,
      "credentials": [{ "type": "password", "value": "viewer", "temporary": false }],
      "realmRoles": ["viewer"]
    }
  ]
}
```

### Running the Stack

```bash
# Clone and navigate to project
cd backend

# Start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - Keycloak Admin: http://localhost:8080 (admin/admin)
# - PostgreSQL: localhost:5432
```

### Environment Variables

Create a `.env` file:

```env
# Database
POSTGRES_PASSWORD=secure_password_here

# Keycloak
KEYCLOAK_ADMIN_PASSWORD=secure_admin_password

# Backend
JWT_SECRET=your_jwt_secret_here
```

**⚠️ SECURITY WARNING**: Never commit `.env` files to version control. Use secrets management in production.

---

## Replacing the Map Tile Layer

### Via UI
1. Open the left toolbar
2. Expand "Map Layer" section
3. Select a preset or enter custom URL
4. Click "Apply"

### Preset Options
- **OpenStreetMap**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **CartoDB Dark**: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- **ESRI Satellite**: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- **OpenTopoMap**: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`

### Custom/Local Tiles
Point to any XYZ tile server:
```
http://your-tile-server/{z}/{x}/{y}.png
```

---

## Algorithm Pseudocode

### Spread Evenly
```
FUNCTION spreadEvenly(aircraft, positions):
    sortedPositions = SORT positions BY occupancy ASC
    FOR each aircraft IN unassigned:
        FOR each position IN sortedPositions:
            IF position.occupancy < position.capacity:
                ASSIGN aircraft TO position
                RE-SORT sortedPositions
                BREAK
```

### Cluster
```
FUNCTION cluster(aircraft, positions):
    sortedPositions = SORT positions BY occupancy DESC
    FOR each aircraft IN unassigned:
        FOR each position IN sortedPositions:
            IF position.occupancy < position.capacity:
                ASSIGN aircraft TO position
                RE-SORT sortedPositions
                BREAK
```

### Minimize Distance (Greedy)
```
FUNCTION minimizeDistance(aircraft, positions):
    remaining = COPY unassigned aircraft
    WHILE remaining NOT EMPTY:
        bestPair = NULL
        bestDistance = INFINITY
        FOR each a IN remaining:
            FOR each p IN positions WITH capacity:
                dist = DISTANCE(a.home, p.location)
                IF dist < bestDistance:
                    bestPair = (a, p)
                    bestDistance = dist
        IF bestPair:
            ASSIGN bestPair.aircraft TO bestPair.position
            REMOVE bestPair.aircraft FROM remaining
        ELSE:
            BREAK
```

---

## Important Notices

### Data Safety
- **SYNTHETIC DATA ONLY**: This tool is for simulation purposes
- **NO REAL COORDINATES**: Do not use real military base coordinates
- **NO PII**: Do not include personally identifiable information
- **AUTHORIZATION REQUIRED**: If using real data, ensure proper legal clearance

### Security Checklist
- [ ] Change default Keycloak admin password
- [ ] Use strong PostgreSQL password
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Review and restrict Keycloak client settings
- [ ] Enable audit logging for compliance

---

## API Endpoints (Backend)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/bases` | List all bases | viewer |
| GET | `/api/positions` | List all positions | viewer |
| GET | `/api/aircraft` | List all aircraft | viewer |
| POST | `/api/assignments` | Assign aircraft to position | admin |
| DELETE | `/api/assignments/:id` | Unassign aircraft | admin |
| POST | `/api/auto-distribute` | Run distribution algorithm | admin |
| POST | `/api/import` | Import CSV data | admin |
| GET | `/api/export` | Export CSV data | viewer |

---

## License

MIT License - For simulation and educational purposes only.
