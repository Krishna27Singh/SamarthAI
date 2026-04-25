import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: "NGO" | "Volunteer";
}) => {
  const { currentUser, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentUser || !userRole) return <Navigate to="/login" replace />;

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === "Volunteer" ? "/field-app" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
