import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Modals with data persistence
  modals: {},
  
  openModal: (modalName, data = null) => 
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { open: true, data }
      }
    })),
  
  closeModal: (modalName) => 
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { open: false, data: null }
      }
    })),
  
  closeAllModals: () => set({ modals: {} }),
  
  getModalState: (modalName) => {
    const state = get();
    return state.modals[modalName] || { open: false, data: null };
  },

  // Notifications
  notifications: [],
  
  addNotification: (type, message, duration = 3000) => {
    const id = Math.random().toString(36);
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }]
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, duration);
  },
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  
  clearNotifications: () => set({ notifications: [] }),

  // Loading state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // Filters
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} })
}));