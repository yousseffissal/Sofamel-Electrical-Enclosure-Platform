import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollToTop from "../tools/ScrollToTop";

function Dashboard() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setIsSidebarVisible(window.innerWidth >= 925);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className="flex h-screen bg-gray-100 overflow-hidden">

        {/* Sidebar */}
        {isSidebarVisible && (
          <div className="w-72 h-screen flex-shrink-0 border-r border-gray-200 bg-white">
            <Sidebar />
          </div>
        )}

        {/* Right Side */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Navbar */}
          <div className="h-20 border-b border-gray-200 bg-white flex-shrink-0">
            <Navbar />
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

        </div>
      </div>
    </>
  );
}

export default Dashboard;