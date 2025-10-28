import React, { useState, useEffect } from "react";
import Rules from "./Rules";
import UseCases from "./UseCases";
import Metrics from "./Metrics";
import Dimensions from "./Dimensions";
import Template from "./Template";
import Navbar from "../../Navbar";
import {
  Bell,
  ListChecks,
  BarChart2,
  LayoutGrid,
  FileText,
} from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";
import NotificationHistory from "./NotificationHistory";

const NotificationsDashboard = ({ can }) => {
  const { language, t } = useLanguage();

  // Always use a safe can function
  const safeCan = typeof can === "function" ? can : () => false;

  const TABS = [
    {
      key: "rules",
      label: t("rules"),
      icon: <ListChecks size={18} className="me-2" />,
      resource: "Rule Management",
    },
    {
      key: "usecases",
      label: t("useCases"),
      icon: <LayoutGrid size={18} className="me-2" />,
      resource: "UseCase Management",
    },
    {
      key: "metrics",
      label: t("metrics"),
      icon: <BarChart2 size={18} className="me-2" />,
      resource: "Metrics Management",
    },
    {
      key: "dimensions",
      label: t("dimensions"),
      icon: <LayoutGrid size={18} className="me-2" />,
      resource: "Dimensions Management",
    },
    {
      key: "templates",
      label: t("templates"),
      icon: <FileText size={18} className="me-2" />,
      resource: "Template Management",
    },
    {
      key: "history",
      label: t("notificationHistory") || "History",
      icon: <Bell size={18} className="me-2" />,
      resource: "Rule Management",
    },
  ];

  const visibleTabs = TABS.filter((tab) => safeCan(tab.resource, "read"));

  // Set the first visible tab as active by default
  const [activeTab, setActiveTab] = useState(
    visibleTabs.length > 0 ? visibleTabs[0].key : null
  );

  useEffect(() => {
    if (visibleTabs.length === 0) {
      setActiveTab(null);
    } else if (!visibleTabs.find((tab) => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);


  if (visibleTabs.length === 0) {
    return (
      <>
        <Navbar />
        <div className="relative z-10">
          <div className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl">
            <div className="max-w-6xl mx-auto mt-4">
              <div>
                <div dir={language === "ar" ? "rtl" : "ltr"}>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center p-5">
                    <Bell className="me-2" size={28} />{" "}
                    {t("notificationsManagement")}
                  </h1>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="text-4xl mb-2">🚫</div>
                  <p className="text-gray-600">
                    {t("noNotificationPermissions") ||
                      "You do not have permissions to manage notifications."}
                    <br />
                    {t("noPermissionsAssignedMessage") ||
                      "No roles or permissions are assigned to your account."}
                    <br />
                    {t("contactAdministratorMessage") ||
                      "Please contact your administrator."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="relative z-10">
        <div
          className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-6xl mx-auto mt-4">
            <header className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Bell className="me-2" size={28} />{" "}
                  {t("notificationsManagement")}
                </h1>
              </div>
              <nav
                className={`flex items-center space-x-2 p-1 bg-white rounded-full shadow-lg ${
                  language === "ar" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                      activeTab === tab.key
                        ? "bg-[#166a45] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>
            </header>
          </div>
          {/* Tab content */}
          <div>
            {activeTab === "rules" && safeCan("Rule Management", "read") && (
              <Rules can={safeCan} />
            )}
            {activeTab === "usecases" &&
              safeCan("UseCase Management", "read") && (
                <UseCases can={safeCan} />
              )}
            {activeTab === "metrics" &&
              safeCan("Metrics Management", "read") && (
                <Metrics can={safeCan} />
              )}
            {activeTab === "dimensions" &&
              safeCan("Dimensions Management", "read") && (
                <Dimensions can={safeCan} />
              )}
            {activeTab === "templates" &&
              safeCan("Template Management", "read") && (
                <Template can={safeCan} />
              )}
            {activeTab === "history" && safeCan("Rule Management", "read") && (
              <NotificationHistory can={safeCan} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsDashboard;
