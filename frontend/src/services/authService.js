import axiosClient from '../api/axios';

export const authService = {
  login: async (email, password) => {
    return axiosClient.post('/auth/login', { email, password });
  },

  register: async (nameOrData, email, password, role) => {
    if (typeof nameOrData === 'object' && nameOrData !== null) {
      return axiosClient.post('/auth/register', nameOrData);
    }
    return axiosClient.post('/auth/register', { name: nameOrData, email, password, role });
  },

  logout: async () => {
    return axiosClient.post('/auth/logout');
  },

  getProfile: async () => {
    return axiosClient.get('/auth/profile');
  }
};

export default authService;
