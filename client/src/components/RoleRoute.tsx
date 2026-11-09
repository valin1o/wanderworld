import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type RoleRouteProps = {
  allowedRoles: Array<'traveler' | 'guide' | 'admin'>;
  children: React.ReactNode;
};

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
