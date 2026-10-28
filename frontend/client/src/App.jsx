import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./components/Footer";
import ScrollToTop from "./tools/ScrollToTop"

function Dashboard() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setIsSidebarVisible(window.innerWidth >= 1100);

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
          <div className="w-72 h-screen flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Right Side */}
        <div className="flex flex-col flex-1 min-w-0">
          {!isSidebarVisible && (

            <div className="h-20">
              <Navbar />
            </div>
          )}
          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
            <Footer />
          </main>

        </div>
      </div>
    </>
  );
}

export default Dashboard;