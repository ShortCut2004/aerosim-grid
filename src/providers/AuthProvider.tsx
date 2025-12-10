import { ReactNode, useEffect } from 'react';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import keycloak, { keycloakInitOptions } from '@/lib/keycloak';
import { useSimulationStore } from '@/hooks/useSimulationStore';

const KeycloakUserSync = () => {
  const { keycloak: kc, initialized } = useKeycloak();
  const setCurrentUser = useSimulationStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (!initialized) return;

    if (kc?.authenticated) {
      const realmRoles = kc.realmAccess?.roles || [];
      const role = realmRoles.includes('admin')
        ? 'admin'
        : realmRoles.includes('viewer')
          ? 'viewer'
          : 'viewer';

      setCurrentUser({
        id: kc.subject || 'keycloak-user',
        username: (kc.tokenParsed?.preferred_username as string) || 'user',
        role,
      });
    } else {
      setCurrentUser({ id: 'guest', username: 'guest', role: 'viewer' });
    }
  }, [initialized, kc?.authenticated, kc?.token, setCurrentUser]);

  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakInitOptions}>
      <KeycloakUserSync />
      {children}
    </ReactKeycloakProvider>
  );
};

export default AuthProvider;

