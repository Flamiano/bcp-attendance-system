import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SideNavbar } from "../components/SideNavbar"; // Make sure path is correct
import { StudentInformation } from "./StudentInformation";
import TeacherDashboard from "./TeacherDashboard";
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
        {/* Logout Button positioned in the top-right corner */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
        >
          Logout
        </button>

        {/* Routes for teacher pages */}
        <Routes>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/student-information" element={<StudentInformation />} />
          <Route path="/attendance" element={<Attendance />} />

          {/* Default redirect to Teacher Dashboard if path doesn't match */}
          <Route path="*" element={<TeacherDashboard />} />
        </Routes>
    </div>
  );
};
