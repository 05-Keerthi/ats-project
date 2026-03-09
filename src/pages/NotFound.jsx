import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const role = localStorage.getItem("role");
    if (role) navigate(`/${role}`);
    else navigate("/auth/login");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-xl shadow">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="mt-2 text-lg text-gray-600">Page not found</p>
        <p className="mt-4 text-sm text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Button onClick={handleGoHome} className="px-6">
            Go to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
