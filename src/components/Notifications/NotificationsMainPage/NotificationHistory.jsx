import React, { useEffect, useState } from "react";
import api from "../../../api";
import useLanguage from "../../../hooks/useLanguage";

function formatDateDMY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

const NotificationHistory = ({ can }) => {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filtering states
  const [filterUser, setFilterUser] = useState("");
  const [filterRule, setFilterRule] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Dropdown data
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [channels, setChannels] = useState([]);

  // Sorting states
  const [sortBy, setSortBy] = useState("executionDateTime");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch dropdown data on mount
  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data || []));
    api.get("/rules").then((res) => setRules(res.data || []));
    api.get("/channels").then((res) => setChannels(res.data || []));
  }, []);

  // Fetch ALL history data (all pages)
  useEffect(() => {
    const fetchAllHistory = async () => {
      setLoading(true);
      let allData = [];
      let totalPages = 1;
      const backendPageSize = 1000; 

      try {
        // Fetch first page to get total count
        const firstRes = await api.get("/notification-history", {
          params: { page: 1, pageSize: backendPageSize },
        });
        allData = firstRes.data.data || [];
        const total = firstRes.data.total || 0;
        totalPages = Math.ceil(total / backendPageSize);

        // Fetch remaining pages
        for (let page = 2; page <= totalPages; page++) {
          const res = await api.get("/notification-history", {
            params: { page, pageSize: backendPageSize },
          });
          allData = [...allData, ...(res.data.data || [])];
        }

        setHistory(allData);
      } catch (error) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistory();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    filterUser,
    filterRule,
    filterStatus,
    filterChannel,
    filterDateFrom,
    filterDateTo,
  ]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Filter history
  const filteredHistory = history
    .filter(
      (item) =>
        !filterRule || String(item.rule?.id || item.rule) === String(filterRule)
    )
    .filter(
      (item) =>
        !filterUser || String(item.user?.id || item.user) === String(filterUser)
    )
    .filter(
      (item) =>
        !filterChannel ||
        String(item.channel?.id || item.channel) === String(filterChannel)
    )
    .filter(
      (item) =>
        !filterStatus ||
        (
          item.status || (item.httpStatus === 200 ? "success" : "failure")
        ).toLowerCase() === filterStatus.toLowerCase()
    )
    .filter((item) => {
      if (!filterDateFrom) return true;
      const d = new Date(item.executionDateTime);
      const itemDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      return itemDate >= filterDateFrom;
    })
    .filter((item) => {
      if (!filterDateTo) return true;
      const d = new Date(item.executionDateTime);
      const itemDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      return itemDate <= filterDateTo;
    });

  // Sort history
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case "executionDateTime":
        aValue = new Date(a.executionDateTime).getTime();
        bValue = new Date(b.executionDateTime).getTime();
        break;
      case "rule":
        aValue =
          rules.find((r) => r.id === (a.rule?.id || a.rule))?.label || "";
        bValue =
          rules.find((r) => r.id === (b.rule?.id || b.rule))?.label || "";
        break;
      case "channel":
        aValue =
          channels.find(
            (c) => String(c.id) === String(a.channel?.id || a.channel)
          )?.label || "";
        bValue =
          channels.find(
            (c) => String(c.id) === String(b.channel?.id || b.channel)
          )?.label || "";
        break;
      case "template":
        aValue = a.notificationTemplate?.subject || "";
        bValue = b.notificationTemplate?.subject || "";
        break;
      case "user":
        aValue =
          users.find((u) => String(u.id) === String(a.user?.id || a.user))
            ?.full_name_en || "";
        bValue =
          users.find((u) => String(u.id) === String(b.user?.id || b.user))
            ?.full_name_en || "";
        break;
      case "status":
        aValue = (
          a.status || (a.httpStatus === 200 ? "success" : "failure")
        ).toLowerCase();
        bValue = (
          b.status || (b.httpStatus === 200 ? "success" : "failure")
        ).toLowerCase();
        break;
      default:
        aValue = "";
        bValue = "";
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate history
  const paginatedHistory = sortedHistory.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {t("notificationHistory") || "Notification History"}
      </h2>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow">
        {/* User filter */}
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] min-w-[120px] bg-gray-50"
        >
          <option value="">{t("user") || "User"}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name_en || u.nafath_id || u.id}
            </option>
          ))}
        </select>
        {/* Rule filter */}
        <select
          value={filterRule}
          onChange={(e) => setFilterRule(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] min-w-[120px] bg-gray-50"
        >
          <option value="">{t("rule") || "Rule"}</option>
          {rules.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label || r.name || r.id}
            </option>
          ))}
        </select>
        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] min-w-[120px] bg-gray-50"
        >
          <option value="">{t("status") || "Status"}</option>
          <option value="success">{t("success") || "Success"}</option>
          <option value="failure">{t("failure") || "Failure"}</option>
        </select>
        {/* Channel filter */}
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] min-w-[120px] bg-gray-50"
        >
          <option value="">{t("channel") || "Channel"}</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label || c.name || c.id}
            </option>
          ))}
        </select>
        {/* Date filters */}
        <label className="text-gray-600 font-medium">
          {t("dateFrom") || "From"}
        </label>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        />
        <label className="text-gray-600 font-medium">{t("to") || "To"}</label>
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        />
        <button
          onClick={() => {
            setFilterUser("");
            setFilterRule("");
            setFilterStatus("");
            setFilterChannel("");
            setFilterDateFrom("");
            setFilterDateTo("");
          }}
          className="px-4 py-2 rounded-xl bg-[#166a45] text-white font-semibold hover:bg-[#145a38] transition"
        >
          {t("clearFilters") || "Clear Filters"}
        </button>
      </div>
      {loading ? (
        <div className="text-gray-500">{t("loading") || "Loading..."}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-2 text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("executionDateTime")}
                >
                  <SortIcon
                    active={sortBy === "executionDateTime"}
                    order={sortOrder}
                  />
                  {t("date") || "Date"}
                  <FilterIcon active={!!(filterDateFrom || filterDateTo)} />
                </th>
                <th
                  className="px-4 py-2 text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("rule")}
                >
                  <SortIcon active={sortBy === "rule"} order={sortOrder} />
                  {t("rule") || "Rule"}
                  <FilterIcon active={!!filterRule} />
                </th>
                <th
                  className="px-4 py-2 text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("channel")}
                >
                  <SortIcon active={sortBy === "channel"} order={sortOrder} />
                  {t("channel") || "Channel"}
                  <FilterIcon active={!!filterChannel} />
                </th>
                <th
                  className="px-4 py-2 text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("template")}
                >
                  <SortIcon active={sortBy === "template"} order={sortOrder} />
                  {t("template") || "Template"}
                </th>
                <th
                  className="px-4 py-2 text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("user")}
                >
                  <SortIcon active={sortBy === "user"} order={sortOrder} />
                  {t("user") || "User"}
                  <FilterIcon active={!!filterUser} />
                </th>
                <th
                  className="px-4 py-2 text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  <SortIcon active={sortBy === "status"} order={sortOrder} />
                  {t("status") || "Status"}
                  <FilterIcon active={!!filterStatus} />
                </th>
                <th className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {t("body") || "Body"}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-4">
                    {t("noHistoryFound") || "No history found"}
                  </td>
                </tr>
              )}
              {paginatedHistory.map((item) => {
                const statusValue =
                  item.status ||
                  (item.httpStatus === 200 ? "success" : "failure");
                const isSuccess = statusValue.toLowerCase() === "success";
                return (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2 text-sm whitespace-nowrap">
                      {formatDateDMY(item.executionDateTime)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {rules.find((r) => r.id === (item.rule?.id || item.rule))
                        ?.label || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {channels.find(
                        (c) =>
                          String(c.id) ===
                          String(item.channel?.id || item.channel)
                      )?.label || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {item.notificationTemplate?.subject || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {users.find(
                        (u) =>
                          String(u.id) === String(item.user?.id || item.user)
                      )?.full_name_en || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          isSuccess
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t(statusValue) || statusValue}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs break-all">
                      {item.request?.body || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-end items-center mt-4 gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              {t("prev") || "Prev"}
            </button>
            <span>
              {t("page") || "Page"} {page} /{" "}
              {Math.ceil(sortedHistory.length / pageSize) || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= sortedHistory.length}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              {t("next") || "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterIcon = ({ active }) => (
  <svg
    className={`inline w-4 h-4 ml-1 ${
      active ? "text-[#166a45]" : "text-gray-400"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z"
    />
  </svg>
);

const SortIcon = ({ active, order }) => (
  <span
    className={`inline-block mr-1 ${
      active ? "text-[#166a45]" : "text-gray-400"
    }`}
  >
    {order === "asc" ? "▲" : "▼"}
  </span>
);

export default NotificationHistory;
