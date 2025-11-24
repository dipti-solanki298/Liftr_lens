import React, { useState } from "react";
import { FiMenu, FiX, FiHelpCircle } from "react-icons/fi";
import { MdOutlineElectricBolt } from "react-icons/md";
import { BiBarChart } from "react-icons/bi";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { useTheme } from "../../context/ThemeContext";

const SidebarItem = ({ icon, label, active, collapsed, onClick }) => {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`flex items-center gap-3 text-sm rounded-lg transition-colors
          ${active ? "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium" : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}
          ${collapsed ? "justify-center w-10 h-10 mx-auto" : "justify-start w-full px-3 py-2"}`}
      >
        {React.createElement(icon, {
          className: `w-5 h-5 flex-shrink-0 ${active ? "text-orange-500" : "text-gray-600 dark:text-gray-400"}`,
        })}
        {!collapsed && <span className="truncate">{label}</span>}
      </button>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className=" left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
          {label}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ onSectionChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Connections");

  const handleSectionClick = (label) => {
    setActive(label);
    if (onSectionChange) {
      onSectionChange(label);
    }
  };

  const topMenuItems = [
    { label: "Connections", icon: MdOutlineElectricBolt },
    { label: "Reports", icon: BiBarChart },
  ];

  const bottomMenuItems = [{ label: "Need Help", icon: FiHelpCircle }];

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:h-full">
        <div
          className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300
            ${collapsed ? "w-16" : "w-64"}`}
        >
          {/* Menu */}
          <div className="flex-1 overflow-auto">
            <div className={`${collapsed ? "px-1" : "px-2"} py-3`}>
              <div className="space-y-1">
                {topMenuItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={active === item.label}
                    collapsed={collapsed}
                    onClick={() => handleSectionClick(item.label)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom area: Need Help + collapse control */}
          <div className="px-2 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div
              className={`flex gap-2 transition-all duration-300 ${
                collapsed ? "flex-col items-center" : "items-center"
              }`}
            >
              {bottomMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSectionClick(item.label)}
                  className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors
                    ${active === item.label ? "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium" : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}
                    ${collapsed ? "justify-center w-10 h-10" : "justify-start flex-1"}`}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${active === item.label ? "text-orange-500" : "text-gray-600 dark:text-gray-400"}`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`flex items-center justify-center text hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm transition flex-shrink-0 text-gray-600 dark:text-gray-400
                  ${collapsed ? "w-10 h-10" : "w-10 h-10"}`}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <GoSidebarCollapse className="w-5 h-5" />
                ) : (
                  <GoSidebarExpand className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main content placeholder */}
        <div className="flex-1 bg-gray-50" />
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
            Assessment
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
