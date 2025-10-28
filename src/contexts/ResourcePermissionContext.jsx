import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const ResourcePermissionContext = createContext();

export const useResourcePermission = () => useContext(ResourcePermissionContext);

export const ResourcePermissionProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userPerms = JSON.parse(localStorage.getItem("userPermissions") || "{}");
        const allowedResourceIds = Object.keys(userPerms);

        if (allowedResourceIds.length === 0) {
          setResources([]);
          setPermissions([]);
          setLoading(false);
          return;
        }

        const [resourcesRes, permissionsRes] = await Promise.allSettled([
          api.get(`/resources`),
          api.get(`/permissions`)
        ]);

        setResources(resourcesRes.status === "fulfilled" ? resourcesRes.value.data : []);
        setPermissions(permissionsRes.status === "fulfilled" ? permissionsRes.value.data : []);
      } catch {
        setResources([]);
        setPermissions([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <ResourcePermissionContext.Provider value={{ resources, permissions, loading }}>
      {children}
    </ResourcePermissionContext.Provider>
  );
};