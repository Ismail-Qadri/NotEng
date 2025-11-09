import React, { useEffect, useState } from "react";
import api from "../../../api";
import useLanguage from "../../../hooks/useLanguage";


function formatDateDMY(date) {
  if (!date) return "-";
  const d = new Date(date);
  // Add 3 hours for Saudi time
  d.setUTCHours(d.getUTCHours() + 3);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

function getTodayDateStringSaudi() {
  // Saudi Arabia is UTC+3
  const now = new Date();
  // Get UTC time, then add 3 hours for Saudi
  now.setUTCHours(now.getUTCHours() + 3);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const History = ({ can }) => {
  // const todayString = getTodayDateString();
  const todayStringSaudi = getTodayDateStringSaudi();
  const { t } = useLanguage();
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filtering states
  const [filterUser, setFilterUser] = useState("");
  const [filterRule, setFilterRule] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(todayStringSaudi);
  const [filterDateTo, setFilterDateTo] = useState(todayStringSaudi);

  // Dropdown data
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [channels, setChannels] = useState([]);

  // Sorting states
  const [sortBy, setSortBy] = useState("executionDateTime");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch dropdown data on mount
  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]));
    api
      .get("/rules")
      .then((res) => setRules(res.data || []))
      .catch(() => setRules([]));
    api
      .get("/channels")
      .then((res) => setChannels(res.data || []))
      .catch(() => setChannels([]));
  }, []);

  // Fetch all history data (no pagination from backend)
  useEffect(() => {
    const fetchAllHistory = async () => {
      setLoading(true);
      try {
        const params = {
          ruleId: filterRule || undefined,
          channelId: filterChannel || undefined,
          userId: filterUser || undefined,
          // status: filterStatus || undefined,
           from: filterDateFrom !== todayStringSaudi ? filterDateFrom : undefined,
  to: filterDateTo !== todayStringSaudi ? filterDateTo : undefined,
        };
        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key]
        );
        const res = await api.get("/notification-history", { params });
        setAllHistory(res.data.data || []);
      } catch (error) {
        setAllHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHistory();
  }, [
    filterUser,
    filterRule,
    filterStatus,
    filterChannel,
    filterDateFrom,
    filterDateTo,
    todayStringSaudi
  ]);

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

  const filteredHistory = allHistory.filter((item) => {
    if (filterStatus === "success") return item.httpStatus === 200;
    if (filterStatus === "failure") return item.httpStatus !== 200;
    return true;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case "executionDateTime":
        aValue = new Date(a.executionDateTime).getTime();
        bValue = new Date(b.executionDateTime).getTime();
        break;
      case "rule":
        aValue = (
          a.rule?.label ||
          rules.find((r) => r.id === (a.rule?.id || a.ruleId))?.label ||
          ""
        ).toLowerCase();
        bValue = (
          b.rule?.label ||
          rules.find((r) => r.id === (b.rule?.id || b.ruleId))?.label ||
          ""
        ).toLowerCase();
        break;
      case "channel":
        aValue = (
          a.channel?.label ||
          channels.find((c) => c.id === (a.channel?.id || a.channelId))
            ?.label ||
          ""
        ).toLowerCase();
        bValue = (
          b.channel?.label ||
          channels.find((c) => c.id === (b.channel?.id || b.channelId))
            ?.label ||
          ""
        ).toLowerCase();
        break;
      case "template":
        aValue = (a.notificationTemplate?.subject || "").toLowerCase();
        bValue = (b.notificationTemplate?.subject || "").toLowerCase();
        break;
      case "user":
        aValue = (
          a.user?.full_name_en ||
          users.find((u) => u.id === (a.user?.id || a.userId))?.full_name_en ||
          ""
        ).toLowerCase();
        bValue = (
          b.user?.full_name_en ||
          users.find((u) => u.id === (b.user?.id || b.userId))?.full_name_en ||
          ""
        ).toLowerCase();
        break;
      case "status":
        aValue = (a.httpStatus === 200 ? "success" : "failure").toLowerCase();
        bValue = (b.httpStatus === 200 ? "success" : "failure").toLowerCase();
        break;
      default:
        aValue = "";
        bValue = "";
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = sortedHistory.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const paginatedHistory = sortedHistory.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

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
          max={filterDateTo || undefined}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        />
        <label className="text-gray-600 font-medium">{t("to") || "To"}</label>
        <input
          type="date"
          value={filterDateTo}
          min={filterDateFrom || undefined}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        />
        <button
          onClick={() => {
            setFilterUser("");
            setFilterRule("");
            setFilterStatus("");
            setFilterChannel("");
            setFilterDateFrom(todayString);
            setFilterDateTo(todayString);
          }}
          className="px-4 py-2 rounded-xl bg-[#166a45] text-white font-semibold hover:bg-[#145a38] transition"
        >
          {t("clearFilters") || "Reset to Today"}
        </button>
      </div>
      {loading ? (
        <div className="text-gray-500 text-center py-8">
          {t("loading") || "Loading..."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("executionDateTime")}
                >
                  <div className="flex items-center gap-1">
                    <SortIcon
                      active={sortBy === "executionDateTime"}
                      order={sortOrder}
                    />
                    {t("date") || "Date"}
                    <FilterIcon active={!!(filterDateFrom || filterDateTo)} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("rule")}
                >
                  <div className="flex items-center gap-1">
                    <SortIcon active={sortBy === "rule"} order={sortOrder} />
                    {t("rule") || "Rule"}
                    <FilterIcon active={!!filterRule} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("channel")}
                >
                  <div className="flex items-center gap-1">
                    <SortIcon active={sortBy === "channel"} order={sortOrder} />
                    {t("channel") || "Channel"}
                    <FilterIcon active={!!filterChannel} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("template")}
                >
                  <div className="flex items-center gap-1">
                    <SortIcon
                      active={sortBy === "template"}
                      order={sortOrder}
                    />
                    {t("template") || "Template"}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("user")}
                >
                  <div className="flex items-center gap-1">
                    <SortIcon active={sortBy === "user"} order={sortOrder} />
                    {t("user") || "User"}
                    <FilterIcon active={!!filterUser} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    <SortIcon active={sortBy === "status"} order={sortOrder} />
                    {t("status") || "Status"}
                    <FilterIcon active={!!filterStatus} />
                  </div>
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {t("body") || "Body"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8">
                    {t("noHistoryFound") || "No history found"}
                  </td>
                </tr>
              )}

              {paginatedHistory.map((item, idx) => {
                let statusValue;
                if (item.httpStatus === 200) {
                  statusValue = "Success";
                } else {
                  statusValue = "Failure";
                }

                const isSuccess = statusValue === "Success";
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDateDMY(item.executionDateTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.rule?.label ||
                        rules.find(
                          (r) => r.id === (item.rule?.id || item.ruleId)
                        )?.label ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.channel?.label ||
                        channels.find(
                          (c) => c.id === (item.channel?.id || item.channelId)
                        )?.label ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.notificationTemplate?.subject || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.user?.full_name_en ||
                        users.find(
                          (u) => u.id === (item.user?.id || item.userId)
                        )?.full_name_en ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          isSuccess
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {statusValue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 break-all max-w-xs">
                      {item.request?.body || item.request?.info || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-700">
              {t("showing") || "Showing"}{" "}
              <span className="font-medium">{paginatedHistory.length}</span>{" "}
              {t("of") || "of"} <span className="font-medium">{total}</span>{" "}
              {t("records") || "records"}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t("prev") || "Previous"}
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                {t("page") || "Page"}{" "}
                <span className="font-medium">{page}</span> /{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t("next") || "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterIcon = ({ active }) => (
  <svg
    className={`w-4 h-4 ${active ? "text-[#166a45]" : "text-gray-400"}`}
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
  <span className={`text-xs ${active ? "text-[#166a45]" : "text-gray-400"}`}>
    {order === "asc" ? "▲" : "▼"}
  </span>
);

export default History;
