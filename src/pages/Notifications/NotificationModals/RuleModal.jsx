import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FaEnvelope, FaSms, FaWhatsapp } from "react-icons/fa";
import api from "../../../api";
import useLanguage from "../../../hooks/useLanguage";
import { UniversalModal, Button, IconButton } from "../../../components/common";

const RuleModal = ({ onSave, rule, onCancel }) => {
  const { t } = useLanguage();

  // State
  const [ruleName, setRuleName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState("");
  const [operator, setOperator] = useState("");
  const [defaultThreshold, setDefaultThreshold] = useState("");
  const [dimension, setDimension] = useState({ id: "", label: "" });
  const [dimensionValue, setDimensionValue] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [selectedMetricId, setSelectedMetricId] = useState(null);
  const [channelTemplates, setChannelTemplates] = useState({});
  const [loading, setLoading] = useState(false);
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
  const [allTemplates, setAllTemplates] = useState([]);

  const availableOperators = [
    { value: ">", label: t("operatorGreaterThan") },
    { value: "<", label: t("operatorLessThan") },
    { value: "=", label: t("operatorEqual") },
    { value: "!=", label: t("operatorNotEqual") },
  ];

  const availableChannels = [
    { id: 1, name: "Email", icon: FaEnvelope, color: "text-blue-600" },
    { id: 2, name: "SMS", icon: FaSms, color: "text-green-600" },
    { id: 3, name: "WhatsApp", icon: FaWhatsapp, color: "text-emerald-600" },
  ];

  // ...existing useEffects (fetch data, prefill, etc.)...
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
        setAllTemplates(
          Array.isArray(templatesRes.data) ? templatesRes.data : []
        );
        setApiLoaded(true);
      })
      .catch((err) => {
        // console.error("Failed to fetch initial data", err);
        setApiLoaded(true);
      });
  }, []);

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

  useEffect(() => {
    const prefillRuleData = async () => {
      if (!rule || !apiLoaded) return;
      try {
        setRuleName(rule.label || "");
        setIsActive(rule.active ?? true);
        setOperator(rule.operator || ">");
        setFrequency(rule.frequency || "");
        setDefaultThreshold(String(rule.thresholdValue) || "");

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
          setDimensionValue(rule.dimensionValue || "");
          try {
            const valRes = await api.get(
              `/dimensions/${rule.dimension.id}/values`
            );
            setDimensionValues(Array.isArray(valRes.data) ? valRes.data : []);
          } catch {
            setDimensionValues([]);
          }
        }

        if (rule.recipients && rule.recipients.length > 0) {
          const prefilledRecipients = [];
          const templatesByChannel = {};

          rule.recipients.forEach((recipient) => {
            if (!templatesByChannel[recipient.channelId]) {
              templatesByChannel[recipient.channelId] = recipient.templateId;
            }

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
                  const hasChannel = prefilledRecipients[
                    existingUserIndex
                  ].channels.includes(recipient.channelId);
                  if (!hasChannel) {
                    prefilledRecipients[existingUserIndex].channels.push(
                      recipient.channelId
                    );
                  }
                } else {
                  prefilledRecipients.push({
                    id: user.id,
                    full_name_en: user.full_name_en || user.name,
                    name: user.name,
                    email: user.email,
                    type: "user",
                    channels: [recipient.channelId],
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
                  const hasChannel = prefilledRecipients[
                    existingGroupIndex
                  ].channels.includes(recipient.channelId);
                  if (!hasChannel) {
                    prefilledRecipients[existingGroupIndex].channels.push(
                      recipient.channelId
                    );
                  }
                } else {
                  prefilledRecipients.push({
                    id: group.id,
                    name: group.name,
                    type: "group",
                    channels: [recipient.channelId],
                  });
                }
              }
            }
          });

          setRecipients(prefilledRecipients);
          setChannelTemplates(templatesByChannel);
        }
      } catch (error) {
        // console.error("Error prefilling rule:", error);
      }
    };
    prefillRuleData();
  }, [rule, apiLoaded, availableUsers, availableGroups, channels]);

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
        type: "user",
        channels: [],
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
        type: "group",
        channels: [],
      },
    ]);
    setSelectedGroup("");
  };

  const handleRecipientRemove = (recipientId) => {
    setRecipients(recipients.filter((rec) => rec.id !== recipientId));
  };

  const handleChannelToggle = (recipientId, channelId) => {
    setRecipients(
      recipients.map((rec) => {
        if (rec.id === recipientId) {
          const hasChannel = rec.channels.includes(channelId);
          if (hasChannel) {
            return {
              ...rec,
              channels: rec.channels.filter((ch) => ch !== channelId),
            };
          } else {
            return {
              ...rec,
              channels: [...rec.channels, channelId],
            };
          }
        }
        return rec;
      })
    );
  };

  const getTemplatesForChannel = (channelId) => {
    return allTemplates.filter((t) => t.channelId === channelId);
  };

  const getActiveChannels = () => {
    const channelIds = new Set();
    recipients.forEach((rec) => {
      rec.channels.forEach((ch) => channelIds.add(ch));
    });
    return Array.from(channelIds);
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
      if (!frequency) newErrors.frequency = t("frequencyRequired");
      if (recipients.length === 0)
        newErrors.recipients = t("recipientsRequired");
      if (defaultThreshold === "" || defaultThreshold === null) {
        newErrors.defaultThreshold = t("thresholdValueRequired");
      } else if (isNaN(Number(defaultThreshold))) {
        newErrors.defaultThreshold = t("thresholdValueInvalid");
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        setLoading(false);
        return;
      }

      const activeChannels = getActiveChannels();
      for (const channelId of activeChannels) {
        if (!channelTemplates[channelId]) {
          const channel = availableChannels.find((ch) => ch.id === channelId);
          alert(`Please select a template for ${channel?.name} channel`);
          setLoading(false);
          return;
        }
      }

      const formattedRecipients = [];
      recipients.forEach((rec) => {
        rec.channels.forEach((channelId) => {
          const recipientObj = {
            channelId,
            templateId: channelTemplates[channelId],
          };
          if (rec.type === "user") {
            recipientObj.userId = rec.id;
          } else {
            recipientObj.groupId = Number(rec.id);
          }
          formattedRecipients.push(recipientObj);
        });
      });

      const ruleData = {
        label: ruleName.trim(),
        metricId: Number(selectedMetricId),
        operator: operator,
        thresholdValue: Number(defaultThreshold),
        frequency: frequency,
        dimensionId:
          showConditional && dimension?.id ? Number(dimension.id) : null,
        dimensionValue:
          showConditional && dimensionValue ? String(dimensionValue) : null,
        active: Boolean(isActive),
        recipients: formattedRecipients,
      };

      await onSave(ruleData, rule?.id);
    } catch (err) {
      // console.error("Validation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h4 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
            {t("notificationsRuleDetails")}
          </h4>
          <label className="block text-gray-700 font-semibold mb-2">
            {t("notificationsRuleName")}
          </label>
          <input
            type="text"
            value={ruleName}
            onChange={(e) => {
              setRuleName(e.target.value);
              if (errors.ruleName)
                setErrors({ ...errors, ruleName: undefined });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
              errors.ruleName ? "border-red-500" : ""
            }`}
            placeholder={t("notificationsRuleNamePlaceholder")}
          />
          {errors.ruleName && (
            <div className="text-red-500 text-xs mt-1">{errors.ruleName}</div>
          )}
          <label className="inline-flex items-center mt-3">
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

        <div>
          <h4 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
            {t("notificationsTriggerConditions")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("notificationsUseCase")}
              </label>
              <select
                value={selectedUseCaseId || ""}
                onChange={(e) => {
                  setSelectedUseCaseId(Number(e.target.value) || null);
                  setSelectedMetricId(null);
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
                  {metrics.map((metric) => (
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
                <option value="">{t("notificationsSelectOperator")}</option>
                {availableOperators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.value} ({op.label})
                  </option>
                ))}
              </select>
              {errors.operator && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.operator}
                </div>
              )}
            </div>

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
                <Button
                  type="button"
                  onClick={async () => {
                    setShowConditional(true);
                    if (selectedMetricId) {
                      try {
                        const res = await api.get(
                          `/dimensions/by-metric/${selectedMetricId}`
                        );
                        setDimensions(Array.isArray(res.data) ? res.data : []);
                      } catch {
                        setDimensions([]);
                      }
                    }
                  }}
                  className="text-green-800 text-xl font-bold flex items-center justify-center"
                >
                  <Plus size={22} />
                </Button>
              ) : (
                <IconButton
                  onClick={() => {
                    setShowConditional(false);
                    setDimension({ id: "", label: "" });
                    setDimensionValue("");
                  }}
                  className="text-red-500 hover:text-red-700"
                  title={t("delete")}
                >
                  <Trash2 size={22} />
                </IconButton>
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
                    onChange={async (e) => {
                      const selected = dimensions.find(
                        (d) => d.id === Number(e.target.value)
                      );
                      setDimension(selected || { id: "", label: "" });
                      setDimensionValue("");
                      if (selected?.id) {
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
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      {t("notificationsSelectDimension")}
                    </option>
                    {dimensions.map((d) => (
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
                    onChange={(e) => setDimensionValue(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
            {t("notificationsRecipientsChannels")}
          </h4>

          <div className="flex items-center gap-2 mb-3">
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
                  (user) =>
                    !recipients.find(
                      (rec) =>
                        String(rec.id) === String(user.id) &&
                        rec.type === "user"
                    )
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name_en || user.name}
                  </option>
                ))}
            </select>
            <Button
              type="button"
              onClick={handleAddUser}
              disabled={!selectedUser}
              className="px-5 py-2 bg-[#166a45] text-white rounded-full font-semibold hover:bg-[#104631] disabled:opacity-50"
            >
              {t("notificationsAdd")}
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-6">
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
                  (group) =>
                    !recipients.find(
                      (rec) => rec.id === group.id && rec.type === "group"
                    )
                )
                .map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
            <Button
              type="button"
              onClick={handleAddGroup}
              disabled={!selectedGroup}
              className="px-5 py-2 bg-[#166a45] text-white rounded-full font-semibold hover:bg-[#104631] disabled:opacity-50"
            >
              {t("notificationsAdd")}
            </Button>
          </div>

          {errors.recipients && (
            <div className="text-red-500 text-sm mb-3">{errors.recipients}</div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">
              {t("notificationsSelectedRecipients")}
            </h4>
            {recipients.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {t("notificationsNoRecipients")}
              </p>
            ) : (
              <div className="space-y-2">
                {recipients.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <span className="font-medium text-gray-800">
                      {rec.full_name_en || rec.name}{" "}
                      {rec.type === "group" ? "(Group)" : ""}
                    </span>
                    <div className="flex items-center gap-3">
                      {availableChannels.map((channel) => {
                        const Icon = channel.icon;
                        const isChecked = rec.channels.includes(channel.id);
                        return (
                          <IconButton
                            key={channel.id}
                            onClick={() =>
                              handleChannelToggle(rec.id, channel.id)
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all ${
                              isChecked
                                ? `${channel.color} border-current bg-opacity-10`
                                : "border-gray-300 text-gray-400 hover:border-gray-400"
                            }`}
                            title={channel.name}
                          >
                            <Icon size={18} />
                          </IconButton>
                        );
                      })}

                      <IconButton
                        onClick={() => handleRecipientRemove(rec.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title={t("delete")}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {getActiveChannels().length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-700 mb-4">
                {t("notificationTemplate")}
              </h4>
              <div className="space-y-3">
                {getActiveChannels().map((channelId) => {
                  const channel = availableChannels.find(
                    (ch) => ch.id === channelId
                  );
                  const Icon = channel?.icon;
                  const templatesForChannel = getTemplatesForChannel(channelId);
                  return (
                    <div key={channelId} className="flex items-center gap-3">
                      <label className="text-gray-700 font-medium min-w-[100px]">
                        {channel?.name}
                      </label>
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${channel?.color} border-current bg-opacity-10`}
                      >
                        {Icon && <Icon size={16} />}
                      </div>
                      <select
                        value={channelTemplates[channelId] || ""}
                        onChange={(e) =>
                          setChannelTemplates((prev) => ({
                            ...prev,
                            [channelId]: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Template</option>
                        {templatesForChannel.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.label ||
                              template.subject ||
                              template.templateName ||
                              `Template ${template.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100"
          >
            {t("notificationsCancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-full bg-[#166a45] text-white font-semibold hover:bg-[#104631] disabled:opacity-50"
          >
            {loading ? "Saving..." : t("notificationsSave")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RuleModal;
