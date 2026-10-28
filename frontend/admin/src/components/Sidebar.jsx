import RoleSidebarMenu from "../layouts/RoleSidebarMenu";
import { MdDashboard } from "react-icons/md";

const Sidebar = () => {
  const year = new Date().getFullYear();
  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="h-20 px-6 border-b border-gray-200 flex items-center">
          <div className="flex items-center gap-3">

              {/* Logo */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-sm">
                  <MdDashboard className="text-white text-2xl" />
              </div>

              {/* Brand */}
              <div>
                <h1 className="text-sm font-semibold text-gray-900 tracking-wide">
                  Sofamel
                </h1>
                <p className="text-xs text-gray-500">
                  Management System
                </p>
              </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
            <RoleSidebarMenu />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 justify-end">
          <div className="text-xs text-gray-400">
            © {year} Sofamel
          </div>
        </div>
    </aside>
  );
};

export default Sidebar;