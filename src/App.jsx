import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/auth/Home";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import EmployerDashboard from "./pages/employer/Dashboard";
import CandidateDashboard from "./pages/candidate/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

const App = () => {
  return (
    <Router basename={import.meta.env.VITE_BASE_NAME}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>

      <Toaster position="top-right" richColors expand duration={4000} closeButton visibleToasts={5} />
    </Router>
  );
};

export default App;