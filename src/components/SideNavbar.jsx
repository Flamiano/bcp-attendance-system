import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi"; // Dashboard
import { PiStudentDuotone } from "react-icons/pi"; // Student Information
import { HiOutlineClipboardDocumentList } from "react-icons/hi2"; // Attendance
import { RiCalendarScheduleLine } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { FaMapMarkedAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { RiMenuFoldFill, RiMenuUnfoldFill } from "react-icons/ri"; // Hide/Unhide Sidebar
import { BiLogOutCircle } from "react-icons/bi"; // Logout Button

const menuItems = [
  {
    icon: <BiSolidDashboard size={24} />,
    text: "Dashboard",
    href: "/teachers/dashboard",
  },
  {
    icon: <PiStudentDuotone size={24} />,
    text: "Student Information",
    href: "/teachers/student-information",
  },
  {
    icon: <HiOutlineClipboardDocumentList size={24} />,
    text: "Attendance",
    href: "/teachers/attendance",
  },
  {
    icon: <RiCalendarScheduleLine size={24} />,
    text: "Class Management",
    href: "/class-management",
  },
  { icon: <TbReportSearch size={24} />, text: "Reports", href: "/reports" },
  { icon: <FaMapMarkedAlt size={24} />, text: "Map", href: "/map" },
  { icon: <IoMdSettings size={24} />, text: "Settings", href: "/settings" },
  {
    icon: <BiLogOutCircle size={24} className="text-red-500 font-bold" />,
    text: "Logout",
    href: "/",
  },
];

export const SideNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open/close state
  const location = useLocation();
  const navigate = useNavigate();

  // Handler for menu item clicks
  const handleMenuClick = (href) => {
    navigate(href);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  //Logout Button
  const handleLogout = () => {
    localStorage.removeItem("userRole"); // Remove role from localStorage
    navigate("/"); // Redirect to home page
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen ${
        isSidebarOpen ? "w-16" : "w-0"
      } bg-blue-900 text-white shadow-lg flex flex-col items-center py-4 space-y-4 z-50 transition-all duration-300`}
    >
      <button onClick={toggleSidebar} className="sidebar-toggle-icon">
        {isSidebarOpen ? (
          <RiMenuFoldFill size={24} />
        ) : (
          <RiMenuUnfoldFill size={24} className="ml-8 text-black" />
        )}
      </button>
      {isSidebarOpen &&
        menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuClick(item.href)}
            className={`sidebar-icon ${
              location.pathname === item.href ? "bg-blue-700" : ""
            }`}
          >
            {item.icon}
            <span className="sidebar-tooltip">{item.text}</span>
          </button>
        ))}
    </div>
  );
};
