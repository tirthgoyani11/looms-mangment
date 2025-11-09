import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          set({
            token,
            user: JSON.parse(user),
            isAuthenticated: true
          });
        }
      },

      updateUser: (userData) => {
        const updatedUser = { ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;
export { useAuthStore };
