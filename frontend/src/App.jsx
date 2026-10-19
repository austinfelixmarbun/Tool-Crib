import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import Borrow from "./pages/Borrow";
import BorrowVerification from "./pages/BorrowVerification";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Return from "./pages/Return";
import UserManagement from "./pages/UserManagement";

import { APP_ROUTES } from "./constants/routes";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={APP_ROUTES.LOGIN}
        replace
      />
    );
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path={APP_ROUTES.LOGIN}
          element={<Login />}
        />

        <Route
          path={APP_ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.BORROW}
          element={
            <ProtectedRoute>
              <Layout>
                <Borrow />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.RETURN}
          element={
            <ProtectedRoute>
              <Layout>
                <Return />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.BORROW_VERIFICATION}
          element={
            <ProtectedRoute>
              <Layout>
                <BorrowVerification />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.INVENTORY}
          element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={APP_ROUTES.USER_MANAGEMENT}
          element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
