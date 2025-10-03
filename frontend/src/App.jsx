import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import SignupPage from "./pages/SignupPage";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";

function App() {
  return (
    <Router basename="/smartClassroom">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/teacher" element={<TeacherLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
