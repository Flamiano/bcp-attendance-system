import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MainPage } from "./MainPage"; // Your welcome page
import { TeacherRouter } from "./teachers/TeacherRouter"; // Teacher-specific router
import { StudentRouter } from "./students/StudentRouter"; // Student-specific router

const App = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const signInUser = (role) => {
    localStorage.setItem("userRole", role); // Persist the role in localStorage
    setUserRole(role); // Update state
  };

  const isAuthenticated = (role) => {
    return userRole === role; // Check if the role matches the current userRole
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage signInUser={signInUser} />} />

        <Route
          path="/teachers/*"
          element={
            isAuthenticated("teacher") ? <TeacherRouter /> : <Navigate to="/" />
          }
        />

        <Route
          path="/students/*"
          element={
            isAuthenticated("student") ? <StudentRouter /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
