import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import QuestionDetail from "./pages/QuestionDetail";
import TopicDetail from "./pages/TopicDetail";
import Loading from "./components/Loading";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import { useAuth } from "./hooks/useAuth";

function AppRoutes() {
  const { isAuthenticated } = useAuth0();
  const { isDemoAuthenticated } = useAuth();
  const isUserAuthenticated = isAuthenticated || isDemoAuthenticated;

  return (
    <Routes>
      {/* Root route - Welcome for non-authenticated, Home for authenticated */}
      <Route
        path="/"
        element={
          isUserAuthenticated ? (
            <AuthenticatedLayout>
              <Home />
            </AuthenticatedLayout>
          ) : (
            <Welcome />
          )
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/question/:id"
        element={
          isUserAuthenticated ? (
            <AuthenticatedLayout>
              <QuestionDetail />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/topic/:id"
        element={
          isUserAuthenticated ? (
            <AuthenticatedLayout>
              <TopicDetail />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch-all route - handles any invalid route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
