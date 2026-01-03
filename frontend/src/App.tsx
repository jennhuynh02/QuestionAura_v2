import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Loading from "./components/Loading";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const isDemoAuthenticated = !!localStorage.getItem("demo_token");

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated || isDemoAuthenticated ? (
              <Home />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
