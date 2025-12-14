import { useState, useCallback } from 'react';
import api from '../api';
import { message } from 'antd';

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (method, endpoint, data = null, config = {}) => {
    setLoading(true);
    try {
      const response = await api[method](endpoint, data, config);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    get: (endpoint, config) => request('get', endpoint, null, config),
    post: (endpoint, data, config) => request('post', endpoint, data, config),
    put: (endpoint, data, config) => request('put', endpoint, data, config),
    delete: (endpoint, config) => request('delete', endpoint, null, config),
  };
};
