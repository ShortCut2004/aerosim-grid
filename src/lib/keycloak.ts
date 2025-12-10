import Keycloak, { KeycloakInitOptions } from 'keycloak-js';

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'sim-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sim-app',
});

export const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'check-sso',
  pkceMethod: 'S256',
};

export default keycloak;

