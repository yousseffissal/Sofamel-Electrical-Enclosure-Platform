import { useAuth } from "../context/AuthContext";

import {
  roles,
  adminLinks,
  managerLinks,
  SuperAdminLinks,
  RHLinks,
} from "../tools/links/NavigationLinks";

import { NavLink } from "react-router-dom";

const menus = {
  [roles.ADMIN]: adminLinks,
  [roles.MANAGER]: managerLinks,
  [roles.RH]: RHLinks,
  [roles.SUPERADMIN]: SuperAdminLinks,
};

function SidebarMenu({ links, level = 0 }) {

  return (
    <nav
      className={`
        px-4 py-6 space-y-1
        ${level > 0
          ? "ml-4 border-l border-gray-200 pl-4"
          : ""
        }
        overflow-y-hidden
      `}
    >

      {links.map((item, index) => (

        <div key={index}>

          <NavLink
            to={`/dashboard/${item.path}`}
            className={({ isActive }) =>
              `
      flex items-center px-4 py-3 rounded-xl
      text-sm font-semibold transition-all duration-200

      ${isActive
                ? "bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-md"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }
    `
            }
          >
            <div className="flex items-center gap-3 w-full">
              {item.icon && <item.icon className="text-lg shrink-0" />}
              <span>{item.name}</span>
            </div>
          </NavLink>

          {item.children && (
            <SidebarMenu
              links={item.children}
              level={level + 1}
            />
          )}

        </div>
      ))}

    </nav>
  );
}

const RoleSidebarMenu = () => {

  const { user } = useAuth();

  const links = menus[user?.level_id] || [];

  return <SidebarMenu links={links} />;
};

export default RoleSidebarMenu;