import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Student Pages
import { StudentSurveys } from './pages/student/StudentSurveys';
import { TakeSurvey } from './pages/student/TakeSurvey';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherSurveys } from './pages/teacher/TeacherSurveys';
import { CreateSurvey } from './pages/teacher/CreateSurvey';

const Home = () => {
  const { isAuthenticated, isStudent, isTeacher } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">EduQuery</h1>
          <p className="text-2xl mb-8">Survey Platform for Education</p>
          <div className="space-x-4">
            <a href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Login
            </a>
            <a href="/register" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  if (isStudent) {
    return <Navigate to="/student/surveys" replace />;
  } else if (isTeacher) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route
              path="/student/surveys"
              element={
                <ProtectedRoute userType="student">
                  <StudentSurveys />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/surveys/:id/take"
              element={
                <ProtectedRoute userType="student">
                  <TakeSurvey />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute userType="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/surveys"
              element={
                <ProtectedRoute userType="teacher">
                  <TeacherSurveys />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/surveys/create"
              element={
                <ProtectedRoute userType="teacher">
                  <CreateSurvey />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
