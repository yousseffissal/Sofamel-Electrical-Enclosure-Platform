import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

// auth
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ForgotPassword from "../pages/ForgetPage.jsx";
import ResetPassword from "../pages/ResetPage.jsx";
import LandingPage from "../pages/LandingPage.jsx";

// layout
import App from "../App.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import AuthRedirect from "../components/AuthRedirect.jsx";
import Privacy from "../pages/Privacy.jsx";
import Terms from "../pages/Terms.jsx";
import Support from "../pages/Support.jsx";
import MaintenancePage from "../pages/MaintenancePage.jsx";

// configurator pages
import BoxTypesPage from "../pages/BoxTypesPage";
import TemplatesPage from "../pages/TemplatesPage";
import ConfiguratorPage from "../pages/ConfiguratorPage";
import SummaryPage from "../pages/SummaryPage";
import ConfigurationStartPage from "../pages/ConfigurationStartPage.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import ConfigurationPage from "../pages/ConfigurationHistoryPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthRedirect>
        <LandingPage />
      </AuthRedirect>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthRedirect>
        <Login />
      </AuthRedirect>
    ),
  },

  {
    path: "/register",
    element: (
      <AuthRedirect>
        <Register />
      </AuthRedirect>
    ),
  },

  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  {
    path: "/forget-password",
    element: (
      <AuthRedirect>
        <ForgotPassword />
      </AuthRedirect>
    ),
  },

  {
    path: "/privacy",
    element:
      <Privacy />
  },

  {
    path: "/terms",
    element:
      <Terms />
  },

  {
    path: "/support",
    element:
      <Support />
  },

  // PROTECTED AREA
  {
    path: "/app",
    element: <PrivateRoute />,
    children: [
      {
        element: <App />,
        children: [
          {
            path: "new",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <ConfigurationStartPage />,
              },

              {
                path: "box-types",
                element: <BoxTypesPage />,
              },

              {
                path: "templates",
                element: <TemplatesPage />,
              },

              {
                path: "configurator",
                element: <ConfiguratorPage />,
              },

              {
                path: "summary",
                element: <SummaryPage />,
              },
            ],
          },
          {
            path: "distributions",
            element: <MaintenancePage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "configurations",
            element: <ConfigurationPage />,
          }
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/app/new" replace />,
  },
]);

export default router;