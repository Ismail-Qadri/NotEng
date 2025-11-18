import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import api from "../../../api";
import useLanguage from "../../../hooks/useLanguage";

const RuleModal = ({ onSave, rule, onCancel }) => {
  const { t } = useLanguage();

  // State
  const [ruleName, setRuleName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState("");
  const [operator, setOperator] = useState("");
  const [defaultThreshold, setDefaultThreshold] = useState("");
  const [conditionalThreshold, setConditionalThreshold] = useState("");
  const [dimension, setDimension] = useState({ id: "", label: "" });
  const [dimensionValue, setDimensionValue] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [selectedMetricId, setSelectedMetricId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [apiLoaded, setApiLoaded] = useState(false);
  const [showConditional, setShowConditional] = useState(false);
  const [errors, setErrors] = useState({});

  // Data
  const [metrics, setMetrics] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [dimensionValues, setDimensionValues] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [channels, setChannels] = useState([]);
  const [templates, setTemplates] = useState([]);
  const availableOperators = [">", "<", "=", "!="];
  const availableChannels = ["Email", "SMS"];

  // Fetch all static data once
  useEffect(() => {
    Promise.all([
      api.get("/users").catch(() => ({ data: [] })),
      api.get("/groups").catch(() => ({ data: [] })),
      api.get("/usecases").catch(() => ({ data: [] })),
      api.get("/channels").catch(() => ({ data: [] })),
      api.get("/notification-templates").catch(() => ({ data: [] })),
    ])
      .then(([usersRes, groupsRes, useCasesRes, channelsRes, templatesRes]) => {
        setAvailableUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setAvailableGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
        setUseCases(Array.isArray(useCasesRes.data) ? useCasesRes.data : []);
        setChannels(Array.isArray(channelsRes.data) ? channelsRes.data : []);
        setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
        setApiLoaded(true);
      })
      .catch((err) => {
        if (import.meta.env.DEV)
          console.error("Failed to fetch initial data", err);
        setApiLoaded(true); // Still set to true so modal can open
      });
  }, []);

  // Fetch metrics when use case changes (but not during edit prefill)
  useEffect(() => {
    if (selectedUseCaseId && !rule) {
      api
        .get(`/metrics?useCaseId=${selectedUseCaseId}`)
        .then((res) => setMetrics(Array.isArray(res.data) ? res.data : []))
        .catch(() => setMetrics([]));
    } else if (!selectedUseCaseId && !rule) {
      setMetrics([]);
      setSelectedMetricId(null);
    }
  }, [selectedUseCaseId, rule]);

  // Fetch dimensions when metric changes (but not during edit prefill)
  useEffect(() => {
    if (selectedMetricId && !rule) {
      api
        .get(`/dimensions/by-metric/${selectedMetricId}`)
        .then((res) => setDimensions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setDimensions([]));
    } else if (!selectedMetricId && !rule) {
      setDimensions([]);
      setDimension({ id: "", label: "" });
    }
  }, [selectedMetricId, rule]);

  // Fetch dimension values when dimension changes (but not during edit prefill)
  useEffect(() => {
    if (dimension?.id && !rule) {
      api
        .get(`/dimensions/${dimension.id}/values`)
        .then((res) =>
          setDimensionValues(Array.isArray(res.data) ? res.data : [])
        )
        .catch(() => setDimensionValues([]));
    } else if (!dimension?.id && !rule) {
      setDimensionValues([]);
      setDimensionValue("");
    }
  }, [dimension, rule]);

  // Consolidated prefill useEffect
  useEffect(() => {
    let cancelled = false;
    const prefillRuleData = async () => {
      if (!rule || !apiLoaded) return;
      try {
        setRuleName(rule.label || "");
        setIsActive(rule.active ?? true);
        setOperator(rule.operator || ">");
        setFrequency(rule.frequency || "");
        setSelectedTemplateId(rule.notificationTemplateId || null);

        const useCaseValue = rule.metric?.useCaseId;
        if (useCaseValue) setSelectedUseCaseId(Number(useCaseValue));
        if (rule.metricId) {
          setSelectedMetricId(rule.metricId);
          if (rule.metric) setMetrics([rule.metric]);
        }
        if (rule.dimensionId && rule.dimension) {
          setShowConditional(true);
          setDimension({
            id: rule.dimension.id,
            label: rule.dimension.label,
          });
          setDimensions([rule.dimension]);
          try {
            const valRes = await api.get(
              `/dimensions/${rule.dimension.id}/values`
            );
            const valuesData = Array.isArray(valRes.data) ? valRes.data : [];
            if (!cancelled) setDimensionValues(valuesData);
          } catch {
            setDimensionValues([]);
          }
        }
        if (rule.dimensionValue) {
          setDimensionValue(rule.dimensionValue);
          setDefaultThreshold(String(rule.thresholdValue) || "");
        } else {
          setDefaultThreshold(String(rule.thresholdValue) || "");
        }
        if (
          rule.recipients &&
          rule.recipients.length > 0 &&
          availableUsers.length > 0 &&
          availableGroups.length > 0 &&
          channels.length > 0
        ) {
          const prefilledRecipients = [];
          rule.recipients.forEach((recipient) => {
            const channel = channels.find(
              (ch) => ch.id === recipient.channelId
            );
            const channelName = channel ? channel.label || channel.name : "";
            if (recipient.userId) {
              const user = availableUsers.find(
                (u) => String(u.id) === String(recipient.userId)
              );
              if (user) {
                const existingUserIndex = prefilledRecipients.findIndex(
                  (rec) =>
                    rec.type === "user" && String(rec.id) === String(user.id)
                );
                if (existingUserIndex >= 0) {
                  if (
                    channelName &&
                    !prefilledRecipients[existingUserIndex].channels.includes(
                      channelName
                    )
                  ) {
                    prefilledRecipients[existingUserIndex].channels.push(
                      channelName
                    );
                  }
                } else {
                  prefilledRecipients.push({
                    id: user.id,
                    full_name_en: user.full_name_en || user.name,
                    name: user.name,
                    email: user.email,
                    channels: channelName ? [channelName] : [],
                    type: "user",
                  });
                }
              }
            } else if (recipient.groupId) {
              const group = availableGroups.find(
                (g) => Number(g.id) === Number(recipient.groupId)
              );
              if (group) {
                const existingGroupIndex = prefilledRecipients.findIndex(
                  (rec) =>
                    rec.type === "group" && Number(rec.id) === Number(group.id)
                );
                if (existingGroupIndex >= 0) {
                  if (
                    channelName &&
                    !prefilledRecipients[existingGroupIndex].channels.includes(
                      channelName
                    )
                  ) {
                    prefilledRecipients[existingGroupIndex].channels.push(
                      channelName
                    );
                  }
                } else {
                  prefilledRecipients.push({
                    id: group.id,
                    name: group.name,
                    channels: channelName ? [channelName] : [],
                    type: "group",
                  });
                }
              }
            }
          });
          setRecipients(prefilledRecipients);
        }
      } catch (error) {
        // ignore
      }
    };
    prefillRuleData();
    return () => {
      cancelled = true;
    };
  }, [rule, apiLoaded, availableUsers, availableGroups, channels]);

  // Update message body when template or related data changes
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        const apiUser =
          availableUsers.length > 0
            ? availableUsers[0].full_name_en ||
              availableUsers[0].name ||
              "Default User Name"
            : "Default User Name";

        const selectedChannels = [
          ...new Set(recipients.flatMap((rec) => rec.channels)),
        ];

        const resolvedChannelIds = channels
          .filter((ch) => {
            const matches =
              selectedChannels.includes(ch.label) ||
              selectedChannels.includes(ch.name) ||
              selectedChannels.some(
                (selected) =>
                  selected.toLowerCase() === (ch.label || "").toLowerCase() ||
                  selected.toLowerCase() === (ch.name || "").toLowerCase()
              );
            return matches;
          })
          .map((ch) => Number(ch.id));

        const templateData = {
          ruleLabel: ruleName || "Default Rule Name",
          userName: apiUser,
          currentValue: "{CurrentValue}",
          metricId: Number(selectedMetricId) || null,
          operator: operator || ">",
          thresholdValue: Number(defaultThreshold) || 0,
          frequency: frequency || "daily",
          users:
            recipients
              .filter((rec) => rec.type === "user" && rec.id)
              .map((rec) => Number(rec.id)) || [],
          groups:
            recipients
              .filter((rec) => rec.type === "group" && rec.id)
              .map((rec) => Number(rec.id)) || [],
          channelIds: resolvedChannelIds,
          notificationTemplateId: Number(selectedTemplateId) || null,
          dimensionId: dimension?.id ? Number(dimension.id) : null,
          dimensionValue: dimensionValue || null,
          active: isActive ?? true,
          useCase: Number(selectedUseCaseId) || null,
        };

        setMessageBody(fillTemplate(template.body || "", templateData));
      }
    } else {
      setMessageBody("");
    }
  }, [
    selectedTemplateId,
    ruleName,
    defaultThreshold,
    frequency,
    operator,
    dimensionValue,
    templates,
    recipients,
    selectedMetricId,
    dimension,
    isActive,
    selectedUseCaseId,
    channels,
    availableUsers,
    selectedUseCaseId,
  ]);

  // Handlers
  const handleAddUser = () => {
    if (!selectedUser) return;
    const userToAdd = availableUsers.find(
      (u) => String(u.id) === String(selectedUser)
    );
    if (!userToAdd) return;
    const alreadyExists = recipients.some(
      (rec) => rec.type === "user" && String(rec.id) === String(userToAdd.id)
    );
    if (alreadyExists) return;
    setRecipients((prev) => [
      ...prev,
      {
        id: userToAdd.id,
        full_name_en: userToAdd.full_name_en || userToAdd.name,
        name: userToAdd.name,
        email: userToAdd.email,
        channels: [],
        type: "user",
      },
    ]);
    setSelectedUser("");
  };

  const handleAddGroup = () => {
    if (!selectedGroup) return;
    const groupToAdd = availableGroups.find(
      (g) => String(g.id) === String(selectedGroup)
    );
    if (!groupToAdd) return;
    const alreadyExists = recipients.some(
      (rec) => rec.type === "group" && String(rec.id) === String(groupToAdd.id)
    );
    if (alreadyExists) return;
    setRecipients((prev) => [
      ...prev,
      {
        id: groupToAdd.id,
        name: groupToAdd.name,
        channels: [],
        type: "group",
      },
    ]);
    setSelectedGroup("");
  };

  const handleRecipientRemove = (recipientId) => {
    setRecipients((recipients) =>
      recipients.filter((rec) => rec.id !== recipientId)
    );
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
    setLoading(true);

    try {
      const newErrors = {};
      if (!ruleName?.trim()) newErrors.ruleName = t("ruleNameRequired");
      if (!selectedUseCaseId) newErrors.useCaseId = t("useCaseRequired");
      if (!selectedMetricId) newErrors.metricId = t("metricRequired");
      if (!operator) newErrors.operator = t("operatorRequired");
      if (!selectedTemplateId) newErrors.templateId = t("templateRequired");
      if (!frequency) newErrors.frequency = t("frequencyRequired");
      if (recipients.length === 0)
        newErrors.recipients = t("recipientsRequired");

      if (defaultThreshold === "" || defaultThreshold === null) {
        newErrors.defaultThreshold = t("thresholdValueRequired");
      } else if (isNaN(Number(defaultThreshold))) {
        newErrors.defaultThreshold = t("thresholdValueInvalid");
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      const selectedChannels = [
        ...new Set(recipients.flatMap((rec) => rec.channels)),
      ];

      if (selectedChannels.length === 0) {
        alert("Please select at least one channel for recipients.");
        return;
      }

      const channelIds = channels
        .filter((ch) => {
          const matches =
            selectedChannels.includes(ch.label) ||
            selectedChannels.includes(ch.name) ||
            selectedChannels.some(
              (selected) =>
                selected.toLowerCase() === (ch.label || "").toLowerCase() ||
                selected.toLowerCase() === (ch.name || "").toLowerCase()
            );
          return matches;
        })
        .map((ch) => Number(ch.id));

      if (channelIds.length === 0) {
        alert("No valid channels found. Please check your channel selection.");
        return;
      }

      const thresholdValue = Number(defaultThreshold);

      if (isNaN(thresholdValue)) {
        alert("Please enter a valid threshold value.");
        return;
      }

      if (isNaN(thresholdValue)) {
        alert("Please enter a valid threshold value.");
        return;
      }

      const ruleData = {
        label: ruleName.trim(),
        metricId: Number(selectedMetricId),
        operator: operator,
        thresholdValue: thresholdValue,
        frequency: frequency,
        users: recipients
          .filter(
            (rec) => rec.type === "user" && rec.id != null && rec.id !== ""
          )
          .map((rec) => rec.id), // Use ID as-is (numeric or UUID)
        groups: recipients
          .filter(
            (rec) => rec.type === "group" && rec.id != null && rec.id !== ""
          )
          .map((rec) => Number(rec.id)), // Ensure group IDs are numbers
        channelIds: channelIds, // Includes SMS if selected
        notificationTemplateId: Number(selectedTemplateId),
        dimensionId:
          showConditional && dimension?.id ? Number(dimension.id) : null,
        dimensionValue:
          showConditional && dimensionValue ? String(dimensionValue) : null,
        active: Boolean(isActive),
        useCase: Number(selectedUseCaseId),
      };

      // Pass data to parent - let parent handle API call
      onSave(ruleData, rule?.id); // Pass rule ID for edit mode
    } catch (err) {
      console.error("❌ Validation failed:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  function fillTemplate(template, data) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
      const cleanKey = key.trim();
      return data[cleanKey] != null ? data[cleanKey] : "";
    });
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 mt-10 transform transition-transform scale-100 max-h-[75vh] flex flex-col">
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
              // onChange={(e) => setRuleName(e.target.value)}
              onChange={(e) => {
                setRuleName(e.target.value);
                if (errors.ruleName)
                  setErrors({ ...errors, ruleName: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 mb-1 ${
                errors.ruleName ? "border-red-500" : ""
              }`}
              placeholder={t("notificationsRuleNamePlaceholder")}
            />
            {errors.ruleName && (
              <div className="text-red-500 text-xs mt-1">{errors.ruleName}</div>
            )}
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
                    const selectedId = Number(e.target.value) || null;
                    setSelectedUseCaseId(selectedId);
                    setSelectedMetricId(null);
                    setDimension({ id: "", label: "" });
                    setDimensionValue("");
                    if (errors.useCaseId)
                      setErrors({ ...errors, useCaseId: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.useCaseId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">{t("notificationsSelectUseCase")}</option>
                  {useCases.map((uc) => (
                    <option key={uc.id} value={uc.id}>
                      {uc.label}
                    </option>
                  ))}
                </select>
                {errors.useCaseId && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.useCaseId}
                  </div>
                )}
              </div>

              {selectedUseCaseId && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {t("metrics")}
                  </label>
                  <select
                    value={selectedMetricId || ""}
                    onChange={(e) => {
                      setSelectedMetricId(Number(e.target.value) || null);
                      if (errors.metricId)
                        setErrors({ ...errors, metricId: undefined });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.metricId ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">{t("notificationsSelectCategory")}</option>
                    {Array.isArray(metrics) &&
                      metrics.map((metric) => (
                        <option key={metric.id} value={metric.id}>
                          {metric.label}
                        </option>
                      ))}
                  </select>
                  {errors.metricId && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.metricId}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsOperator")}
                </label>
                <select
                  value={operator}
                  onChange={(e) => {
                    setOperator(e.target.value);
                    if (errors.operator)
                      setErrors({ ...errors, operator: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.operator ? "border-red-500" : ""
                  }`}
                >
                  <option value="">
                    {t("notificationsSelectOperator") || "Select Operator"}
                  </option>
                  {availableOperators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                {errors.operator && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.operator}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsThresholdValue")}
                </label>
                <input
                  type="number"
                  value={defaultThreshold}
                  onChange={(e) => {
                    setDefaultThreshold(e.target.value);
                    if (errors.defaultThreshold)
                      setErrors({ ...errors, defaultThreshold: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.defaultThreshold ? "border-red-500" : ""
                  }`}
                />
                {errors.defaultThreshold && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.defaultThreshold}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("notificationsRuleCheckFrequency")}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(e.target.value);
                    if (errors.frequency)
                      setErrors({ ...errors, frequency: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.frequency ? "border-red-500" : ""
                  }`}
                >
                  <option value="">{t("notificationsSelectFrequency")}</option>
                  <option value="minutely">Minutely</option>
                  <option value="hourly">
                    {t("notificationsFrequencyHourly")}
                  </option>
                  <option value="daily">
                    {t("notificationsFrequencyDaily")}
                  </option>
                  <option value="weekly">
                    {t("notificationsFrequencyWeekly")}
                  </option>
                  <option value="monthly">
                    {t("notificationsFrequencyMonthly")}
                  </option>
                </select>
                {errors.frequency && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.frequency}
                  </div>
                )}
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
                    onClick={async () => {
                      setShowConditional(true);
                      setDimension({ id: "", label: "" });
                      setDimensionValue("");
                      setDimensionValues([]);
                      // Fetch dimensions for the selected metric
                      if (selectedMetricId) {
                        try {
                          const res = await api.get(
                            `/dimensions/by-metric/${selectedMetricId}`
                          );
                          setDimensions(
                            Array.isArray(res.data) ? res.data : []
                          );
                        } catch {
                          setDimensions([]);
                        }
                      }
                    }}
                    className="text-green-800 text-3xl font-bold"
                    title="Add Conditional Threshold"
                  >
                    +
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowConditional(false);
                      setConditionalThreshold("");
                      setDimension({ id: "", label: "" });
                      setDimensionValue("");
                    }}
                    className="text-red-500 hover:text-red-700 text-xl"
                    title="Remove Conditional Threshold"
                  >
                    <Trash2 size={22} />
                  </button>
                )}
              </div>
              {showConditional && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t("notificationsDimensionDistrict")}{" "}
                        <span className="text-gray-400 font-normal">
                          ({t("optional")})
                        </span>
                      </label>

                      <select
                        value={dimension?.id || ""}
                        onChange={async (e) => {
                          const selected = dimensions.find(
                            (d) => d.id === Number(e.target.value)
                          );
                          setDimension(selected || { id: "", label: "" });
                          setDimensionValue("");
                          setDimensionValues([]);
                          if (selected && selected.id) {
                            try {
                              const valRes = await api.get(
                                `/dimensions/${selected.id}/values`
                              );
                              setDimensionValues(
                                Array.isArray(valRes.data) ? valRes.data : []
                              );
                            } catch {
                              setDimensionValues([]);
                            }
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 "
                      >
                        <option value="">
                          {t("notificationsSelectDimension")}
                        </option>
                        {dimensions
                          .filter((d) => d)
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t("notificationsDimensionValue")}{" "}
                        <span className="text-gray-400 font-normal">
                          ({t("optional")})
                        </span>
                      </label>
                      <select
                        value={dimensionValue || ""}
                        onChange={(e) => setDimensionValue(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 $"
                      >
                        <option value="">
                          {t("notificationsSelectDimensionValue")}
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
                  </div>
                </>
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
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-semibold min-w-[70px]">
                  {t("notificationsUser")}
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    if (errors.recipients)
                      setErrors({ ...errors, recipients: undefined });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t("notificationsSelect")}</option>
                  {availableUsers
                    .filter(
                      (user) =>
                        !recipients.find(
                          (rec) =>
                            (String(rec.id) === String(user.id) ||
                              Number(rec.id) === Number(user.id)) &&
                            rec.type === "user"
                        )
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name_en || user.name}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={!selectedUser}
                  className="px-5 py-2 bg-[#166a45] text-white rounded-full font-semibold shadow hover:bg-[#104631] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("notificationsAdd")}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-semibold min-w-[70px]">
                  {t("notificationsGroup")}
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    if (errors.recipients)
                      setErrors({ ...errors, recipients: undefined });
                  }}
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
                  className="px-5 py-2 bg-[#166a45] text-white rounded-full font-semibold shadow hover:bg-[#104631] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("notificationsAdd")}
                </button>
              </div>
              {errors.recipients && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.recipients}
                </div>
              )}
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
                          {rec.full_name_en || rec.name}{" "}
                          {rec.type === "group" ? "(Group)" : ""}
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
          </div>

          {/* Notification Template Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              {t("notificationsTemplate")}
            </label>
            <select
              value={selectedTemplateId || ""}
              onChange={(e) => {
                setSelectedTemplateId(Number(e.target.value) || null);
                if (errors.templateId)
                  setErrors({ ...errors, templateId: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.templateId ? "border-red-500" : ""
              }`}
            >
              <option value="">{t("notificationsSelectTemplate")}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.subject || "No Subject"}
                </option>
              ))}
            </select>
            {errors.templateId && (
              <div className="text-red-500 text-xs mt-1">
                {errors.templateId}
              </div>
            )}
          </div>

          {/* Message Body */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Message Template
            </label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Template message will appear here"
              readOnly
            />
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

export default RuleModal;
