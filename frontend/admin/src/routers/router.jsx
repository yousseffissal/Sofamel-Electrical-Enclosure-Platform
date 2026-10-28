import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login.jsx";

import Dashboard from "../pages/Dashboard.jsx";

import ErrorPage from "../pages/ErrorPage.jsx";
import MaintenancePage from "../components/MaintenancePage;.jsx";

import OnlineUsers from "../components/OnlineUsers.jsx";
import ClientsPage from "../components/ClientsPage.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import AuthRedirect from "../components/AuthRedirect";
import RoleGuard from "../components/RoleGuard";

import AdminProfile from "../components/AdminProfile.jsx";
import Armoires from "../pages/Armoires.jsx";
import Items from "../pages/Items.jsx";
import BoxTypes from "../components/BoxTypes.jsx";
import ArmoiresTemplates from "../components/ArmoiresTemplates.jsx";
import AllTemplates from "../components/AllTemplates.jsx";
import TemplateItems from "../components/TemplateItems.jsx";
import AllItems from "../components/AllItems.jsx";
import NotificationsPage from "../components/NotificationsPage.jsx";
import Overview from "../components/Overview.jsx";
import Catalogue from "../components/Catalogue.jsx";
import Orders from "../components/Orders.jsx";
import Reports from "../components/Reports.jsx";
import ArchivedOrders from "../components/Archivedorders.jsx";

import routeRoles from "../tools/permissions.js";

const protectRoute = (path, element) => ({
    path,
    element: (
        <RoleGuard allowedRoles={routeRoles[path]}>
            {element}
        </RoleGuard>
    ),
});

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <AuthRedirect>
                <Login />
            </AuthRedirect>
        ),
        errorElement: <ErrorPage />,
    },

    {
        path: "dashboard",
        element: <PrivateRoute />,
        children: [
            {
                path: "",
                element: <Dashboard />,
                children: [

                    protectRoute(
                        "overview",
                        <Overview />
                    ),

                    protectRoute(
                        "settings",
                        <AdminProfile />
                    ),

                    protectRoute(
                        "orders",
                        <Orders />
                    ),

                    protectRoute(
                        "archive",
                        <ArchivedOrders />
                    ),

                    protectRoute(
                        "catalogue",
                        <Catalogue />

                    ),

                    protectRoute(
                        "boxes",
                        <BoxTypes />
                    ),

                     {
                        path: "templates",
                        element: <RoleGuard allowedRoles={routeRoles["templates"]}><Items /></RoleGuard>,
                        children: [
                            {
                                path: "",
                                element: <AllTemplates />
                            },
                            {
                                path: ":id",
                                element: <ArmoiresTemplates />
                            },
                        ],
                    },

                    {
                        path: "items",
                        element: <RoleGuard allowedRoles={routeRoles["items"]}><Items /></RoleGuard>,
                        children: [
                            {
                                path: "",
                                element: <AllItems />
                            },
                            {
                                path: "allowedItems/:id",
                                element: <TemplateItems />
                            },
                        ],
                    },

                    protectRoute(
                        "configurations",
                        <MaintenancePage />
                    ),

                    protectRoute(
                        "admins",
                        <OnlineUsers />
                    ),

                    protectRoute(
                        "notifications",
                        <NotificationsPage />
                    ),

                    protectRoute(
                        "clients",
                        <ClientsPage />
                    ),

                    protectRoute(
                        "repports",
                        <Reports />
                    ),
                ],
            },
        ],
    },
]);

export default router;