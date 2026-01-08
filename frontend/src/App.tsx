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

  return (
    <Routes>
      {/* Public route - NO sidebars, NO AuthenticatedLayout */}
      <Route path="/welcome" element={<Welcome />} />

      {/* Authenticated routes - WITH sidebars via AuthenticatedLayout */}
      <Route
        path="/*"
        element={
          isAuthenticated || isDemoAuthenticated ? (
            <AuthenticatedLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/question/:id" element={<QuestionDetail />} />
                <Route path="/topic/:id" element={<TopicDetail />} />
              </Routes>
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/welcome" />
          )
        }
      />
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
