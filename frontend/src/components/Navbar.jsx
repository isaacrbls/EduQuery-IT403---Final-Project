import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isTeacher } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            EduQuery
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {isStudent && (
                  <>
                    <Link to="/student/surveys" className="hover:text-blue-200">
                      My Surveys
                    </Link>
                    <Link to="/student/responses" className="hover:text-blue-200">
                      Response History
                    </Link>
                  </>
                )}

                {isTeacher && (
                  <>
                    <Link to="/teacher/dashboard" className="hover:text-blue-200">
                      Dashboard
                    </Link>
                    <Link to="/teacher/surveys" className="hover:text-blue-200">
                      My Surveys
                    </Link>
                    <Link to="/teacher/sections" className="hover:text-blue-200">
                      Sections
                    </Link>
                  </>
                )}

                <Link to="/profile" className="hover:text-blue-200">
                  {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAuth = true, userType = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user?.user_type !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

