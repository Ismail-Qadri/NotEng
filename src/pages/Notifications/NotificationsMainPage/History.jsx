import React, { useEffect, useState } from "react";
import api from "../../../api";
import useLanguage from "../../../hooks/useLanguage";
import { Table } from "../../../components/common";
import PageHeader from "../../../components/common/PageHeader";

// function formatDateDMY(date) {
//   if (!date) return "-";
//   const d = new Date(date);
//   d.setUTCHours(d.getUTCHours() + 3);
//   const day = String(d.getUTCDate()).padStart(2, "0");
//   const month = String(d.getUTCMonth() + 1).padStart(2, "0");
//   const year = d.getUTCFullYear();
//   return `${day}-${month}-${year}`;
// }

function formatDateDMY(date) {
  if (!date) return "-";
  const d = new Date(date);
  d.setUTCHours(d.getUTCHours() + 3);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
function getTodayDateStringSaudi() {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 3);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

const History = ({ can }) => {
  const todayStringSaudi = getTodayDateStringSaudi();
  const { t } = useLanguage();
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [filterUser, setFilterUser] = useState("");
  const [filterRule, setFilterRule] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(todayStringSaudi);
  const [filterDateTo, setFilterDateTo] = useState(todayStringSaudi);
  const [filterRecipientId, setFilterRecipientId] = useState(""); // <-- Add this state

  // Dropdown data
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [channels, setChannels] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch dropdown data
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

  // Fetch history
  useEffect(() => {
    const fetchAllHistory = async () => {
      setLoading(true);
      try {
        const params = {
          ruleId: filterRule || undefined,
          channelId: filterChannel || undefined,
          userId: filterUser || undefined,
          recipientId: filterRecipientId || undefined, // <-- Add here
          from:
            filterDateFrom !== todayStringSaudi ? filterDateFrom : undefined,
          to: filterDateTo !== todayStringSaudi ? filterDateTo : undefined,
        };
        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key]
        );
        const res = await api.get("/notification-history", { params });
        setAllHistory(res.data.data || []);
      } catch {
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
    filterRecipientId,
    todayStringSaudi,
  ]); // <-- Add filterRecipientId

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

  // const filteredHistory = allHistory.filter((item) => {
  //   if (filterStatus === "success") return item.httpStatus === 200;
  //   if (filterStatus === "failure") return item.httpStatus !== 200;
  //   return true;
  // });

  const filteredHistory = allHistory.filter((item) => {
    // Status filter
    if (filterStatus === "success" && item.httpStatus !== 200) return false;
    if (filterStatus === "failure" && item.httpStatus === 200) return false;
    // Recipient ID search filter (case-insensitive, partial match)
    if (
      filterRecipientId &&
      !String(item.recipientId)
        .toLowerCase()
        .includes(filterRecipientId.toLowerCase())
    )
      return false;
    return true;
  });

  const columns = [
    {
      title: (
        <span>
          {t("date") || "Date"}
          <FilterIcon
            active={
              !!(
                filterDateFrom !== todayStringSaudi ||
                filterDateTo !== todayStringSaudi
              )
            }
          />
        </span>
      ),
      dataIndex: "executionDateTime",
      key: "executionDateTime",
      render: (date) => formatDateDMY(date),
      sorter: (a, b) =>
        new Date(a.executionDateTime).getTime() -
        new Date(b.executionDateTime).getTime(),
    },
    {
      title: (
        <span>
          {t("rule") || "Rule"}
          <FilterIcon active={!!filterRule} />
        </span>
      ),
      dataIndex: ["rule", "label"],
      key: "rule",
      render: (text, record) => record.rule?.label || "-",
      sorter: (a, b) =>
        (a.rule?.label || "").localeCompare(b.rule?.label || ""),
    },
    {
      title: (
        <span>
          {t("user") || "User"}
          <FilterIcon active={!!filterUser} />
        </span>
      ),
      dataIndex: ["user", "full_name_en"],
      key: "user",
      render: (text, record) => record.user?.full_name_en || "-",
      sorter: (a, b) =>
        (a.user?.full_name_en || "").localeCompare(b.user?.full_name_en || ""),
    },
    {
      title: (
        <span>
          {t("channel") || "Channel"}
          <FilterIcon active={!!filterChannel} />
        </span>
      ),
      dataIndex: ["channel", "label"],
      key: "channel",
      render: (text, record) => record.channel?.label || "-",
      sorter: (a, b) =>
        (a.channel?.label || "").localeCompare(b.channel?.label || ""),
    },
    {
      title: t("recipientId") || "Recipient ID",
      dataIndex: "recipientId",
      key: "recipientId",
      render: (id) => id || "-",
      sorter: (a, b) =>
        (a.recipientId || "").localeCompare(b.recipientId || ""),
    },
    // {
    //   title: t("template") || "Template",
    //   dataIndex: ["notificationTemplate", "subject"],
    //   key: "template",
    //   render: (text, record) => record.notificationTemplate?.subject || "-",
    //   sorter: (a, b) => (a.notificationTemplate?.subject || "").localeCompare(b.notificationTemplate?.subject || ""),
    // },

    {
      title: (
        <span>
          {t("status") || "Status"}
          <FilterIcon active={!!filterStatus} />
        </span>
      ),
      dataIndex: "httpStatus",
      key: "status",
      render: (status) => {
        const isSuccess = status === 200;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isSuccess
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isSuccess ? "Success" : "Failure"}
          </span>
        );
      },
      sorter: (a, b) => a.httpStatus - b.httpStatus,
    },
    // {
    //   title: t("body") || "Body",
    //   dataIndex: "request",
    //   key: "body",
    //   render: (request) => (
    //     <span className="text-xs break-all max-w-xs block">
    //       {request?.body || request?.info || "-"}
    //     </span>
    //   ),
    //   ellipsis: true,
    // },
    {
      title: t("templateName"),
      dataIndex: "request",
      key: "label",
      render: (request) => (
        <span className="text-xs break-all max-w-xs block">
          {request?.label || "-"}
        </span>
      ),
      ellipsis: true,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-8">
      <PageHeader
        title={t("notificationHistory") || "Notification History"}
        icon={
          <svg
            className="w-6 h-6 text-[#166a45]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
      />
      <div className="flex flex-wrap gap-2 items-center mb-4">
        {/* Recipient ID Search Input */}
        <input
          type="text"
          value={filterRecipientId}
          onChange={(e) => setFilterRecipientId(e.target.value)}
          placeholder={t("recipientId") || "Recipient ID"}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        />
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        >
          <option value="">{t("user") || "User"}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name_en || u.nafath_id || u.id}
            </option>
          ))}
        </select>
        <select
          value={filterRule}
          onChange={(e) => setFilterRule(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        >
          <option value="">{t("rule") || "Rule"}</option>
          {rules.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label || r.name || r.id}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        >
          <option value="">{t("status") || "Status"}</option>
          <option value="success">{t("success") || "Success"}</option>
          <option value="failure">{t("failure") || "Failure"}</option>
        </select>
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
        >
          <option value="">{t("channel") || "Channel"}</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label || c.name || c.id}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDateFrom}
          max={filterDateTo || undefined}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
          aria-label={t("dateFrom") || "From"}
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          value={filterDateTo}
          min={filterDateFrom || undefined}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-gray-50"
          aria-label={t("to") || "To"}
        />
        <button
          onClick={() => {
            setFilterUser("");
            setFilterRule("");
            setFilterStatus("");
            setFilterChannel("");
            setFilterDateFrom(todayStringSaudi);
            setFilterDateTo(todayStringSaudi);
            setFilterRecipientId(""); // <-- Reset recipientId filter
          }}
          className="px-5 py-2 rounded-lg bg-[#166a45] text-white font-semibold hover:bg-[#145a38] transition"
        >
          {t("clearFilters") || "Clear Filters"}
        </button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredHistory}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: filteredHistory.length,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        showActions={false}
        rowKey="id"
      />
    </div>
  );
};

export default History;
