import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Trash2 } from "lucide-react";
import useLanguage from "../../../hooks/useLanguage";

const API_BASE_URL = "https://dev-api.wedo.solutions:3000/api";
const api = axios.create({ baseURL: API_BASE_URL });

const NotificationsUserModal = ({ onSave, rule, onCancel }) => {
  const [ruleName, setRuleName] = useState(rule?.ruleName || "");
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [useCase, setUseCase] = useState(rule?.useCase || "");
  const [category, setCategory] = useState(rule?.category || "");
  const [frequency, setFrequency] = useState(rule?.frequency || "");
  const [operator, setOperator] = useState(rule?.operator || ">");
  const [defaultThreshold, setDefaultThreshold] = useState(
    rule?.defaultThreshold || ""
  );
  const [dimension, setDimension] = useState({ id: "", label: "" });
  const [recipients, setRecipients] = useState(rule?.recipients || []);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [smsTemplate, setSmsTemplate] = useState("");
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [selectedMetricId, setSelectedMetricId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [channels, setChannels] = useState([]);
  const [templates, setTemplates] = useState([]);
  const availableOperators = [">", "<", "=", "!="];
  const availableChannels = ["Email", "SMS"];
  const [showConditional, setShowConditional] = useState(!!rule?.dimension);
  const [dimensionValues, setDimensionValues] = useState([]);
  const [dimensionValue, setDimensionValue] = useState("");

  const [isConditionalThresholdSet, setIsConditionalThresholdSet] = useState(false);

  // API-driven data
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [useCases, setUseCases] = useState([]);

  // Add a state for dimensions
  const [dimensions, setDimensions] = useState([]);

  // Add state for conditional threshold input
  const [conditionalThreshold, setConditionalThreshold] = useState("");

  const { t } = useLanguage();

  useEffect(() => {
    // Users
    api.get("/users")
      .then((res) => setAvailableUsers(res.data))
    
      .catch((err) => console.error("Failed to fetch users", err));
console.log("Available users:", availableUsers);
    // Groups
    api.get("/groups")
      .then((res) => setAvailableGroups(res.data))
      .catch((err) => console.error("Failed to fetch groups", err));
console.log("Available groups:", availableGroups);
    // Use Cases
    api.get("/usecases")
      .then((res) => setUseCases(res.data))
      .catch((err) => console.error("Failed to fetch use cases", err));
    // Channels
    api.get("/channels")
      .then(res => setChannels(res.data))
      .catch(err => console.error("Failed to fetch channels", err));

    // Templates
    api.get("/templates")
      .then(res => setTemplates(res.data))
      .catch(err => console.error("Failed to fetch templates", err));
  }, []);

  // Fetch metrics when use case changes
  useEffect(() => {
    if (selectedUseCaseId) {
      axios
        .get(`https://dev-api.wedo.solutions:3000/api/metrics/${selectedUseCaseId}`)
        .then((res) => setMetrics(res.data))
        .catch((err) => console.error("Failed to fetch metrics", err));
    } else {
      setMetrics([]);
    }
  }, [selectedUseCaseId]);

  // Add this useEffect to fetch dimension when selectedMetricId changes
  useEffect(() => {
    if (selectedMetricId) {
      api.get(`/dimensions/${selectedMetricId}`)
        .then(res => {
          // The API returns an array with one dimension object or empty
          setDimension(res.data[0] || { id: "", label: "" });
          console.log("Fetched dimension:", res.data[0]);
        })
        .catch(err => console.error("Failed to fetch dimension", err));
    } else {
      setDimension({ id: "", label: "" });
    }
  }, [selectedMetricId]);

  
  // Fetch possible values for the dimension when dimension.id changes
  useEffect(() => {
    if (dimension?.id) {
      api.get(`/dimensions/${dimension.id}/values`)
        .then(res => setDimensionValues(res.data))
        .catch(err => console.error("Failed to fetch dimension values", err));
    } else {
      setDimensionValues([]);
    }
  }, [dimension]);

  // Fetch dimensions for the selected metric
  useEffect(() => {
    if (selectedMetricId) {
      api.get(`/dimensions/${selectedMetricId}`)
        .then(res => {
          setDimensions(res.data);
          // Reset selected dimension to "no selection" when metric changes
          setDimension({ id: "", label: "" });
        })
        .catch(err => console.error("Failed to fetch dimensions", err));
    } else {
      setDimensions([]);
      setDimension({ id: "", label: "" });
    }
  }, [selectedMetricId]);


  const handleRecipientRemove = (recipientId) => {
    setRecipients(recipients.filter((rec) => rec.id !== recipientId));
  };

  const handleChannelToggle = (recipientId, channel) => {
    setRecipients(
      recipients.map((rec) => {
        if (rec.id === recipientId) {
          const hasChannel = rec.channels.includes(channel);
          return {
            ...rec,
            channels: hasChannel
              ? rec.channels.filter((c) => c !== channel)
              : [...rec.channels, channel],
          };
        }
        return rec;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedChannels = [
      ...new Set(
        recipients.flatMap(rec => rec.channels)
      )
    ];

    // Only set channelId if a channel is selected
    const channelId = selectedChannels.length > 0
      ? channels.find(
          ch => ch.label === selectedChannels[0] || ch.name === selectedChannels[0]
        )?.id || null
      : null;

    const ruleData = {
      label: ruleName,
      metricId: selectedMetricId,
      notificationTemplateId: selectedTemplateId,
      active: isActive,
      operator,
      frequency,
      dimensionValue,
      thresholdValue: Number(conditionalThreshold) || Number(defaultThreshold),
      users: recipients
  .filter(rec => rec.type !== "group")
  .map(rec => rec.id), // Use the ID directly if it's a string/UUID
      groups: recipients
  .filter(rec => rec.type === "group")
  .map(rec => rec.id),
      channelId, // Use the derived channelId
      dimensionId: dimension?.id,
    };
    try {
      // POST to backend
      const response = await api.post("/rules", ruleData);
      onSave(response.data); // Pass new rule to parent
    } catch (err) {
      console.error("Failed to create rule", err);
      // Optionally show error to user
    }
    console.log("Rule data to submit:", ruleData);
  };

    // For adding a user
  const handleAddUser = () => {
    const userToAdd = availableUsers.find(u => u.id === selectedUser);
    if (userToAdd && !recipients.find(rec => rec.id === userToAdd.id)) {
      setRecipients([
        ...recipients,
        { ...userToAdd, channels: [], type: "user" } // Ensure type is "user"
      ]);
      setSelectedUser("");
    }
  };

  // For adding a group
  const handleAddGroup = () => {
    const groupToAdd = availableGroups.find(g => String(g.id) === String(selectedGroup));
    console.log("Trying to add group:", groupToAdd);
    if (groupToAdd && !recipients.find(rec => rec.id === groupToAdd.id)) {
      setRecipients([
        ...recipients,
        { ...groupToAdd, channels: [], type: "group" }
      ]);
      setSelectedGroup("");
    }
  };

  
  const handleDeleteConditionalThreshold = async () => {
    setShowConditional(false);
    setDimension({ id: "", label: "" });

    if (rule?.id) {
      const updatedRule = {
        ...rule,
        dimension: null,
      };
      await axios.put(
        `https://dev-api.wedo.solutions:3000/rules/${rule.id}`,
        updatedRule
      );
      // onSave(updatedRule);
    }
  };

  const getDefaultEmailTemplate = () =>
  `Rule "${ruleName || "Unnamed"}" for ${getUseCaseName(selectedUseCaseId)} has been triggered. Threshold: ${defaultThreshold || "N/A"}.`;

  const getDefaultSmsTemplate = () =>
    `ALERT: Rule exceeded threshold (${defaultThreshold || "N/A"}).`;

  const getUseCaseName = (id) => {
    const found = useCases.find((uc) => uc.id === id);
    return found ? found.label : "N/A";
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
        {/* <div className="overflow-y-auto max-h-[70vh] p-6 mt-36"> */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {rule ? t("editRuleModal") : t("addRuleModal")}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[70vh] p-2"
        >
          {/* Rule Details */}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
              {t("notificationsRuleDetails")}
            </h4>
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="ruleName"
            >
              {t("notificationsRuleName")}
            </label>
            <input
              id="ruleName"
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 mb-1"
              placeholder="Add Role Name"
              required
            />
            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="form-checkbox text-teal-600 rounded-md"
              />
              <span className="ml-2 text-gray-700">
                {t("notificationsActive")}
              </span>
            </label>
          </div>

          {/* Trigger Conditions */}
          <div className="mt-2 mb-6">
            <h4 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
              {t("notificationsTriggerConditions")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsUseCase")}
                </label>
                <select
                  value={selectedUseCaseId || ""}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    setSelectedUseCaseId(selectedId);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t("notificationsSelectUseCase")}</option>
                  {useCases.map((uc) => (
                    <option key={uc.id} value={uc.id}>
                      {uc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Only show Category if a Use Case is selected */}
              {selectedUseCaseId && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {/* {t("notificationsCategory")} */}
                    Metrics
                  </label>
                  <select
                    value={selectedMetricId || ""}
                    onChange={(e) => setSelectedMetricId(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">{t("notificationsSelectCategory")}</option>
                    {metrics.map((metric) => (
                      <option key={metric.id} value={metric.id}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsOperator")}
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {availableOperators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsDefaultThreshold")}
                </label>
                <input
                  type="number"
                  value={defaultThreshold}
                  onChange={(e) => setDefaultThreshold(e.target.value)}
                  // Disable input when operator is "=" or "!="
                  disabled={["=", "!="].includes(operator) || !!conditionalThreshold}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${conditionalThreshold || ["=", "!="].includes(operator) ? "bg-gray-100 opacity-70" : ""}`}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsRuleCheckFrequency")}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t("notificationsSelectFrequency")}</option>
                  <option value="Hourly">
                    {t("notificationsFrequencyHourly")}
                  </option>
                  <option value="Daily">
                    {t("notificationsFrequencyDaily")}
                  </option>
                  <option value="Weekly">
                    {t("notificationsFrequencyWeekly")}
                  </option>
                  <option value="Monthly">
                    {t("notificationsFrequencyMonthly")}
                  </option>
                </select>
              </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-600">
                  {t("notificationsConditionalThreshold")}
                </h4>
                {!showConditional ? (
                  <button
                    type="button"
                    onClick={() => setShowConditional(true)}
                    className="text-green-800 text-3xl font-bold"
                    title="Add Conditional Threshold"
                  >
                    +
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteConditionalThreshold}
                    className="text-red-500 hover:text-red-700 text-xl"
                    title="Remove Conditional Threshold"
                  >
                    <Trash2 size={22} />
                  </button>
                )}
              </div>
              {showConditional && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("notificationsDimensionDistrict")}
                    </label>
                   <select
      value={dimension?.id || ""}
      onChange={e => {
        const selected = dimensions.find(d => d.id === Number(e.target.value));
        setDimension(selected || { id: "", label: "" });
      }}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <option value="">Select Dimension</option>
      {dimensions
  .filter(d => d) // Skip null/undefined
  .map(d => (
    <option key={d.id} value={d.id}>
      {d.label}
    </option>
  ))}
    </select>
                  
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("notificationsDimensionValue")}
                    </label>
                                        <select
                      value={dimensionValue || ""}
                      onChange={e => setDimensionValue(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">
                        Select a Value
                      </option>
                      {dimensionValues.map((val, idx) => {
                        const valueKey = Object.keys(val)[0];
                        return (
                          <option key={idx} value={val[valueKey]}>
                            {val[valueKey]}
                          </option>
                        );
                      })}
                    </select>
                    
                  </div>
                     {/* <div>
                      <select>
                      <option value="">
                        {t("notificationsSelectDistrict")}
                      </option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("notificationsSpecifyThreshold")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={conditionalThreshold}
                        onChange={e => {
                          // Always store as a number
                          const value = e.target.value === "" ? "" : Number(e.target.value);
                          setConditionalThreshold(value);
                          setIsConditionalThresholdSet(!!value);
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recipients & Channels */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {t("notificationsRecipientsChannels")}
            </h3>
            <h4 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
              {t("notificationsAddRecipients")}
            </h4>

            <div className="flex flex-col gap-4 mb-4">
              {/* Add User Row */}
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-semibold min-w-[70px]">
                  {t("notificationsUser")}
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t("notificationsSelect")}</option>
                  {availableUsers
                    .filter(
                      (user) => !recipients.find((rec) => rec.id === user.id)
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name_en}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={!selectedUser}
                  className="px-5 py-2 bg-[#166a45] text-white rounded-full font-semibold shadow hover:bg-[#104631] transition-colors duration-200"
                >
                  {t("notificationsAdd")}
                </button>
              </div>
              {/* Add Group Row */}
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-semibold min-w-[70px]">
                  {t("notificationsGroup")}
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t("notificationsSelect")}</option>
                  {availableGroups
                    .filter(
                      (group) => !recipients.find((rec) => rec.id === group.id)
                    )
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddGroup}
                  disabled={!selectedGroup}
                  className="px-5 py-2 bg-[#166a45] text-white rounded-full font-semibold shadow hover:bg-[#104631] transition-colors duration-200"
                >
                  {t("notificationsAdd")}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2 mt-10">
                {t("notificationsSelectedRecipients")}
              </h4>
              {recipients.length === 0 ? (
                <p className="text-gray-500">
                  {t("notificationsNoRecipients")}
                </p>
              ) : (
                <div className="grid gap-3">
                  {recipients.map((rec) => (
                    <div
                      key={rec.id}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-800">
  {rec.full_name_en || rec.name} {rec.type === "group" ? "(Group)" : ""}
</span>
                      </div>
                      <div className="flex gap-4 mt-2 md:mt-0">
                        {availableChannels.map((channel) => (
                          <label
                            key={channel}
                            className="flex items-center gap-1"
                          >
                            <input
                              type="checkbox"
                              checked={rec.channels.includes(channel)}
                              onChange={() =>
                                handleChannelToggle(rec.id, channel)
                              }
                              className="form-checkbox text-teal-600 rounded-md"
                            />
                            <span className="text-gray-700">{channel}</span>
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleRecipientRemove(rec.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Templates Section */}
            {(recipients.some((rec) => rec.channels.includes("Email")) ||
              recipients.some((rec) => rec.channels.includes("SMS"))) && (
              <div className="w-full mt-8 border-t border-gray-300 pt-6">
                <h4 className="text-xl font-bold text-gray-700 mb-4">
                  {t("messageTemplates")}
                </h4>

                {recipients.some((rec) => rec.channels.includes("Email")) && (
                  <div className="w-full mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm">
                    <label className="block text-gray-700 font-semibold mb-1">
                      {t("emailTemplate")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-white text-gray-800"
                      placeholder="Enter your email message template..."
                      value={emailTemplate || getDefaultEmailTemplate()}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                    />
                  </div>
                )}

                {recipients.some((rec) => rec.channels.includes("SMS")) && (
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm">
                    <label className="block text-gray-700 font-semibold mb-1">
                      {t("smsTemplate")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166a45] bg-white text-gray-800"
                      placeholder="Enter your SMS message template..."
                      value={smsTemplate || getDefaultSmsTemplate()}
                      onChange={(e) => setSmsTemplate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              {t("notificationsCancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full shadow-md font-semibold bg-[#166a45] text-white hover:bg-[#104631] transition-colors duration-200"
            >
              {t("notificationsSave")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NotificationsUserModal;