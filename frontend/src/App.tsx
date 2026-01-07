import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import QuestionDetail from "./pages/QuestionDetail";
import TopicDetail from "./pages/TopicDetail";
import Loading from "./components/Loading";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const isDemoAuthenticated = !!localStorage.getItem("demo_token");

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - NO sidebars, NO AuthenticatedLayout */}
        <Route path="/login" element={<Welcome />} />
        
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
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
