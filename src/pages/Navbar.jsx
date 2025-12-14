import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield, Bell, LayoutDashboard } from "lucide-react";
import useLanguage from "../hooks/useLanguage";
import nav_logo from "/assets/MOMAH_LOGO.svg";
import { Button } from "../components/common";

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const langBtnRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current?.contains(e.target) &&
        !langBtnRef.current?.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isArabic = language === "ar";

  const menuItems = [
    {
      path: "/permissions",
      label: isArabic ? "إدارة الصلاحيات" : "Managing Permissions",
      icon: <Shield size={18} />,
    },
    {
      path: "/notifications",
      label: isArabic ? "إدارة الإشعارات" : "Managing Notifications",
      icon: <Bell size={18} />,
    },
    {
      path: "/",
      label: isArabic ? "لوحات المؤشرات" : "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
  ];

  return (
    <>
      <nav
        dir={isArabic ? "rtl" : "ltr"}
        className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg flex items-center justify-between h-[70px] px-[30px] transition-all duration-300"
      >
        <div className="flex items-center gap-5">
          <button
            ref={btnRef}
            type="button"
            aria-label="Menu"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer relative bg-[rgba(64,126,201,0.1)] text-[#407ec9] hover:border hover:border-[#407ec9] transition-all"
          >
            <Menu size={20} />
          </button>

          <button
            ref={langBtnRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLanguage(isArabic ? "en" : "ar");
              setIsMenuOpen(false);
            }}
            className="font-normal text-[16px] text-[#407EC9] hover:text-[#1757a3] transition-colors duration-200 focus:outline-none"
          >
            {isArabic ? "English" : "عربي"}
          </button>
        </div>

        <Link to="/" className="flex items-center">
          <img
            src={nav_logo}
            alt="Logo"
            className={`h-9 ${isArabic ? "mr-4" : "ml-4"}`}
          />
        </Link>
      </nav>

      {/* Side Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 h-full w-4/5 max-w-[300px] bg-white shadow-2xl transform transition-transform duration-300 z-[9999] flex flex-col p-5 
          ${
            isArabic
              ? isMenuOpen
                ? "right-0"
                : "-right-full"
              : isMenuOpen
              ? "left-0"
              : "-left-full"
          }
        `}
      >
        <div className="flex justify-between items-center mb-5">
          <span className="text-lg font-bold text-gray-700">
            {isArabic ? "القائمة" : "Menu"}
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="bg-gray-100 border-none rounded-lg w-9 h-9 text-lg cursor-pointer text-[#407EC9] flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <hr className="border-gray-200 mb-5" />

        {/* Links */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setActiveLink(item.path);
                setIsMenuOpen(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all shadow-sm border border-gray-100
                ${
                  activeLink === item.path
                    ? "bg-[#166a45] text-white shadow-md"
                    : "bg-gray-50 hover:bg-teal-50 text-gray-700"
                }
              `}
            >
              {item.icon}
              <span className="font-semibold text-[14px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[9998]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
