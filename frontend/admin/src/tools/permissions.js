import {
    adminLinks,
    managerLinks,
    RHLinks,
    SuperAdminLinks,
    roles
} from "./links/NavigationLinks";

const routeRoles = {};

function addPermissions(links, role) {
    links.forEach((link) => {

        routeRoles[link.path.toLowerCase()] ??= [];

        if (!routeRoles[link.path.toLowerCase()].includes(role)) {
            routeRoles[link.path.toLowerCase()].push(role);
        }

        if (link.children) {
            addPermissions(link.children, role);
        }
    });
}

addPermissions(adminLinks, roles.ADMIN);
addPermissions(managerLinks, roles.MANAGER);
addPermissions(RHLinks, roles.RH);
addPermissions(SuperAdminLinks, roles.SUPERADMIN);

export default routeRoles;