import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userAPI } from '../services/api.js';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.login({ email, password });
          localStorage.setItem('token', response.data.token);
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false
          });
          return response;
        } catch (error) {
          const errorMsg = error.message || 'Login failed';
          set({
            error: errorMsg,
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.register(userData);
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMsg = error.message || 'Registration failed';
          set({
            error: errorMsg,
            isLoading: false
          });
          throw error;
        }
      },

      getMe: async () => {
        try {
          const response = await userAPI.getMe();
          set({ user: response.data });
          return response;
        } catch (error) {
          set({ user: null, token: null });
          localStorage.removeItem('token');
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
);