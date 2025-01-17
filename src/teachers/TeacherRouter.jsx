import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SideNavbar } from "../components/SideNavbar"; // Adjust the path if needed
import { StudentInformation } from "./StudentInformation";
import Dashboard from "./Dashboard";
import Attendance from "./Attendance";

export const TeacherRouter = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole"); // Remove role from localStorage
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="flex h-screen">
      <SideNavbar />
      <main className="flex-grow bg-gray-100">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student-information" element={<StudentInformation />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </main>
    </div>
  );
};
