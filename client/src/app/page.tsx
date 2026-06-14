"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";

import Dashboard from "@/container/Dashboard";
import LoadingScreen from "@/modules/auth/LoadingScreen";
import ErrorScreen from "@/modules/auth/ErrorScreen";

export default function Home() {
  const {
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();
  const { logout } = useAuthStore();

  // Auto-redirect to Auth0 if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, error, loginWithRedirect]);

  const handleLogout = () => {
    localStorage.removeItem("cosync_token");
    logout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (error) return <ErrorScreen error={error} handleLogout={handleLogout} />;
  if (isLoading || !isAuthenticated) return <LoadingScreen />;

  return <Dashboard />;
}
