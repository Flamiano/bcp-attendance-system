import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MainPage } from "./MainPage"; // Main page for sign-in/sign-up
import { TeacherRouter } from "./teachers/TeacherRouter"; // Teacher router for teacher-specific routes
import StudentDashboard from "./students/StudentDashboard"; // Student dashboard

const App = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const signInUser = (role) => {
    localStorage.setItem("userRole", role);
    setUserRole(role);
  };

  const isAuthenticated = (role) => userRole === role;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage signInUser={signInUser} />} />

        {/* Teacher Routes */}
        <Route
          path="/teachers/*"
          element={
            isAuthenticated("teacher") ? <TeacherRouter /> : <Navigate to="/" />
          }
        />

        {/* Student Dashboard Route */}
        <Route
          path="/students/dashboard"
          element={
            isAuthenticated("student") ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
