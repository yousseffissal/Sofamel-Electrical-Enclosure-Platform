import { useAuth } from "../context/AuthContext";
import ErrorPage from "../pages/ErrorPage";

const RoleGuard = ({ allowedRoles = [], children }) => {

  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.level_id)) {

    return (
      <ErrorPage
        status={403}
        title="Unauthorized"
        message="You do not have permission to access this page."
      />
    );
  }

  return children;
};

export default RoleGuard;