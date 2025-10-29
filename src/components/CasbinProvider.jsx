import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";

const isDev = import.meta.env.DEV;

const CasbinProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [casbinPolicies, setCasbinPolicies] = useState([]);
  const [contextData, setContextData] = useState({
    resources: [],
    permissions: [],
    roles: [],
  });
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const fetchDataAndBuildPolicies = async () => {
      setIsReady(false);

      try {
        const userId = localStorage.getItem("userId");
        const userPerms = JSON.parse(
          localStorage.getItem("userPermissions") || "{}"
        );
        const allowedResourceIds = Object.keys(userPerms);

        if (!userId || allowedResourceIds.length === 0) {
          console.warn(
            "⚠️ No userId or permissions in localStorage. Aborting."
          );
          setCasbinPolicies([]);
          setContextData({ resources: [], permissions: [], roles: [] });
          setIsReady(true);
          return;
        }

        // Fetch all data in parallel
        const [resourcesRes, permissionsRes, rolesRes] =
          await Promise.allSettled([
            api.get(`/resources`),
            api.get(`/permissions`),
            api.get(`/roles`),
          ]);

        const resourcesData =
          resourcesRes.status === "fulfilled" ? resourcesRes.value.data : [];
        const allPermissionsData =
          permissionsRes.status === "fulfilled"
            ? permissionsRes.value.data
            : [];
        const rolesData =
          rolesRes.status === "fulfilled" ? rolesRes.value.data : [];

        // Build policies directly from fetched data
        const policyRules = [];
        Object.entries(userPerms).forEach(([resourceId, permIds]) => {
          const resource = resourcesData.find(
            (r) => String(r.id) === String(resourceId)
          );
          if (!resource) return;

          permIds.forEach((permId) => {
            const perm = allPermissionsData.find(
              (p) => String(p.id) === String(permId)
            );
            if (perm) {
              policyRules.push([userId, resource.name, perm.name]);
            }
          });
        });

        setCasbinPolicies(policyRules);

        // Set all context data at once
        setContextData({
          resources: resourcesData,
          permissions: allPermissionsData,
          roles: rolesData,
        });
        setIsReady(true);
      } catch (error) {
        if (isDev) console.error("❌ Error in CasbinProvider:", error);
        setCasbinPolicies([]);
        setContextData({ resources: [], permissions: [], roles: [] });
        setIsReady(true); // Become ready even on error to not block UI
      }
    };

    fetchDataAndBuildPolicies();
  }, [refreshCounter]);

  const refreshPermissions = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  const can = useCallback(
    (resourceName, action) => {
      const userId = localStorage.getItem("userId");
      if (!isReady || !userId || !resourceName || !action) {
        return false;
      }

      try {
        const hasPermission = casbinPolicies.some(
          (policy) =>
            policy[0] === userId &&
            policy[1] === resourceName &&
            policy[2] === action
        );
        return hasPermission;
      } catch (error) {
        if (isDev) console.error("❌ Error in 'can' function:", error);
        return false;
      }
    },
    [isReady, casbinPolicies]
  );

  const contextValue = useMemo(
    () => ({
      can,
      isReady,
      resources: contextData.resources,
      permissions: contextData.permissions,
      roles: contextData.roles,
      refreshPermissions,
    }),
    [can, isReady, contextData, refreshPermissions]
  );

  // The children will get the context value via the render prop in App.jsx
  return children(contextValue);
};

export default CasbinProvider;
