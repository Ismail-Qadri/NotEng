import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { message } from 'antd';

export const useCRUD = (endpoint, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.get(endpoint);
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [endpoint]);

  const create = async (values) => {
    try {
      const result = await api.post(endpoint, values);
      setData(prev => [...prev, result]);
      message.success('Created successfully');
      return result;
    } catch (error) {
      throw error;
    }
  };

  const update = async (id, values) => {
    try {
      const result = await api.put(`${endpoint}/${id}`, values);
      setData(prev => prev.map(item => item.id === id ? result : item));
      message.success('Updated successfully');
      return result;
    } catch (error) {
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      setData(prev => prev.filter(item => item.id !== id));
      message.success('Deleted successfully');
    } catch (error) {
      throw error;
    }
  };

  return {
    data,
    loading,
    create,
    update,
    remove,
    refresh: fetchData,
  };
};