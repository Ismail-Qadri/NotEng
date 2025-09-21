import React, { useState, useEffect, useRef } from "react";
import useLanguage from "../hooks/useLanguage";
import nav_logo from '../assets/REGA_LOGO.svg';

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const langBtnRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target) &&
        !langBtnRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isArabic = language === "ar";

  return (
    <>
      <nav
        dir={isArabic ? "rtl" : "ltr"}
        className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg flex items-center justify-between h-[70px] px-[30px] transition-all duration-300"
      >
        <div className="flex items-center gap-5">
          {/* Menu toggle button */}
          <button
            ref={btnRef}
            type="button"
            aria-label="Menu"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="menuButton--default flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer relative bg-[rgba(64,126,201,0.1)] text-[#407ec9] hover:border hover:border-[#407ec9]"
          >
            <span
              className="block w-[18px] h-[2px] bg-current absolute left-1/2 top-1/2 rounded-sm"
              style={{ transform: "translate(-50%,-50%) translateY(-6px)" }}
            ></span>
            <span
              className="block w-[18px] h-[2px] bg-current absolute left-1/2 top-1/2 rounded-sm"
              style={{ transform: "translate(-50%,-50%)" }}
            ></span>
            <span
              className="block w-[18px] h-[2px] bg-current absolute left-1/2 top-1/2 rounded-sm"
              style={{ transform: "translate(-50%,-50%) translateY(6px)" }}
            ></span>
          </button>

           {/* Language button */}
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

        <a href="/" className="flex items-center">
          <img
            src={nav_logo}
            alt="Logo"
            className={`h-9 ${isArabic ? "mr-4" : "ml-4"}`}
          />
        </a>
      </nav>
      {/* Side Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 h-full w-4/5 w-[80%] max-w-[300px] bg-white shadow-lg transform transition-transform duration-300 z-[9999] flex flex-col p-5 
        transition-transform duration-300
          ${isArabic
            ? isMenuOpen
              ? "right-0"
              : "-left-full"
            : isMenuOpen
            ? "left-0"
            : "-right-full"
          }
        `}
      >

        <div className="flex justify-between items-center mb-5">
          <span className="text-lg font-bold text-gray-600">
            {isArabic ? "القائمة" : "List"}
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="bg-gray-100 border-none rounded-lg w-9 h-9 text-lg cursor-pointer text-[#407EC9] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <hr className="border-gray-200" />

        {/* Links */}
        <div className="mt-5 grid gap-4">
          <a
            href="/"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors shadow-sm border border-gray-100"
          >
            <span className="font-semibold text-[14px] text-[#1757a3]">
              {isArabic ? "إدارة الصلاحيات" : "Managing Permissions"}
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors shadow-sm border border-gray-100"
          >
            <span className="font-semibold text-[14px] ">
              {isArabic ? "إدارة الإشعارات" : "Managing Notifications"}
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors shadow-sm border border-gray-100"
          >
            <span className="font-semibold text-[14px] ">
              {isArabic ? "لوحات المؤشرات" : "Dashboard"}
            </span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
