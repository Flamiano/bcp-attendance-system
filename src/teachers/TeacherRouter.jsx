import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SideNavbar } from "../components/SideNavbar"; // Make sure path is correct
import { StudentInformation } from "./StudentInformation";
import TeacherDashboard from "./TeacherDashboard";
import Attendance from "./Attendance";

export const TeacherRouter = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex h-screen">
      <SideNavbar />

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
