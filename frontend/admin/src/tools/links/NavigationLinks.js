import {
    FiShoppingCart,
    FiBox,
    FiSettings,
    FiZap,
    FiBook,
    FiArchive,
    FiAlertCircle
} from "react-icons/fi";

import { BsBroadcast } from "react-icons/bs";

import { RiAdminLine } from "react-icons/ri";

import { GoReport } from "react-icons/go";

import { PiUsers } from "react-icons/pi";

import { GrConfigure, GrOverview, GrHelpBook } from "react-icons/gr";

export const roles = {
    ADMIN: 1,
    MANAGER: 3,
    SUPERADMIN: 2,
    RH: 4,
};

/* ===================== ADMIN ===================== */
export const adminLinks = [
    {
        name: "Overview",
        path: "overview",
        icon: GrOverview
    },
    {
        name: "Orders",
        path: "orders",
        icon: FiShoppingCart,
    },
    {
        name: "Archive",
        path: "archive",
        icon: FiArchive ,
    },
    {
        name: "Admins",
        path: "admins",
        icon: RiAdminLine,
    },
    {
        name: "Clients",
        path: "clients",
        icon: PiUsers,
    },
    {
        name: "Catalogue",
        path: "catalogue",
        icon: FiBook,
        children: [
            {
                name: "Boxes",
                path: "boxes",
                icon: FiBox,
            },
            {
                name: "Templates",
                path: "templates",
                icon: FiBox,
            },
        ],
    },
    {
        name: "Items",
        path: "items",
        icon: FiZap,
    },
    {
        name: "Configurations",
        path: "configurations",
        icon: GrConfigure,
    },
    {
        name: "Notification Center",
        path: "notifications",
        icon: BsBroadcast,
    },
    {
        name: "Customers Repports",
        path: "repports",
        icon: FiAlertCircle,
    },
    {
        name: "Settings",
        path: "settings",
        icon: FiSettings,
    },
];

/* ===================== MANAGER ===================== */
export const managerLinks = [
    {
        name: "Overview",
        path: "overview",
        icon: GrOverview
    },
    {
        name: "Orders",
        path: "orders",
        icon: FiShoppingCart,
    },
    {
        name: "Admins",
        path: "admins",
        icon: RiAdminLine,
    },
    {
        name: "Clients",
        path: "clients",
        icon: PiUsers,
    },
    {
        name: "Settings",
        path: "settings",
        icon: FiSettings,
    },
];

/* ===================== RH ===================== */
export const RHLinks = [
    {
        name: "Overview",
        path: "overview",
        icon: GrOverview
    },
    {
        name: "Orders",
        path: "orders",
        icon: FiShoppingCart,
    },
    {
        name: "Clients",
        path: "clients",
        icon: PiUsers,
    },
    {
        name: "Catalogue",
        path: "catalogue",
        icon: FiBook,
        children: [
            {
                name: "Boxes",
                path: "boxes",
                icon: FiBox,
            },
            {
                name: "Templates",
                path: "templates",
                icon: FiBox,
            },
        ],
    },
    {
        name: "Settings",
        path: "settings",
        icon: FiSettings,
    },
];

/* ===================== SUPER ADMIN ===================== */
export const SuperAdminLinks = [
    {
        name: "Overview",
        path: "overview",
        icon: GrOverview
    },
    {
        name: "Orders",
        path: "orders",
        icon: FiShoppingCart,
    },
    {
        name: "Admins",
        path: "admins",
        icon: RiAdminLine,
    },
    {
        name: "Clients",
        path: "clients",
        icon: PiUsers,
    },
    {
        name: "Settings",
        path: "settings",
        icon: FiSettings,
    },
];