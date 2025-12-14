import React, { useState, useEffect } from "react";
import Rules from "./Rules";
import UseCases from "./UseCases";
import Metrics from "./Metrics";
import Dimensions from "./Dimensions";
import Template from "./Template";
import History from "./History";
import Navbar from "../../Navbar";
import { Card, PageHeader } from "../../../components/common";
import {
  Bell,
  ListChecks,
  BarChart2,
  LayoutGrid,
  FileText,
  History as HistoryIcon,
} from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";

const NotificationsDashboard = ({ can }) => {
  const { language, t } = useLanguage();
  const safeCan = typeof can === "function" ? can : () => false;

  const TABS = [
    {
      key: "rules",
      label: t("rules"),
      icon: ListChecks,
      resource: "Rule Management",
      component: Rules,
    },
    {
      key: "usecases",
      label: t("useCases"),
      icon: LayoutGrid,
      resource: "UseCase Management",
      component: UseCases,
    },
    {
      key: "metrics",
      label: t("metrics"),
      icon: BarChart2,
      resource: "Metrics Management",
      component: Metrics,
    },
    {
      key: "dimensions",
      label: t("dimensions"),
      icon: LayoutGrid,
      resource: "Dimensions Management",
      component: Dimensions,
    },
    {
      key: "templates",
      label: t("templates"),
      icon: FileText,
      resource: "Template Management",
      component: Template,
    },
    {
      key: "history",
      label: t("history") || "History",
      icon: HistoryIcon,
      resource: "Rule Management",
      component: History,
    },
  ];

  const visibleTabs = TABS.filter((tab) => safeCan(tab.resource, "read"));
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

  // No permissions view
  if (visibleTabs.length === 0) {
    return (
      <>
        <Navbar />
        <div className="relative z-10">
          <div
            className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl"
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div className="max-w-6xl mx-auto mt-4">
              <PageHeader
                title={t("notificationsManagement")}
                icon={<Bell size={28} />}
              />
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚫</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("noNotificationPermissions") ||
                      "No Notification Permissions"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {t("noPermissionsAssignedMessage") ||
                      "No roles or permissions are assigned to your account."}
                    <br />
                    {t("contactAdministratorMessage") ||
                      "Please contact your administrator."}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  const ActiveComponent = visibleTabs.find(
    (tab) => tab.key === activeTab
  )?.component;

  return (
    <>
      <Navbar />
      <div className="relative z-10">
        <div
          className="bg-gray-100 p-8 pb-12 font-sans antialiased m-36 rounded-2xl shadow-xl"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-6xl mx-auto mt-4">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Bell className="me-2" size={32} />
                {t("notificationsManagement")}
              </h1>

              {/* Tab Navigation */}
              <nav
                className={`flex items-center p-1 bg-white rounded-full shadow-lg
                ${
                  language === "ar"
                    ? "flex-row space-x-reverse space-x-2"
                    : "flex-row space-x-2"
                }
              `}
              >
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors duration-200 whitespace-nowrap ${
                        activeTab === tab.key
                          ? "bg-[#166a45] text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon size={18} className="me-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </header>

            {/* Active Tab Content */}
            <div className="mt-6">
              {ActiveComponent && <ActiveComponent can={safeCan} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsDashboard;
