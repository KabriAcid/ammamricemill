import React, { createContext, useContext, useReducer } from 'react';
import { UIState } from '../types';

interface UIContextType extends UIState {
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'OPEN_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_THEME' };

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false };
    case 'OPEN_SIDEBAR':
      return { ...state, sidebarOpen: true };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    default:
      return state;
  }
};

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  loading: false,
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const closeSidebar = () => dispatch({ type: 'CLOSE_SIDEBAR' });
  const openSidebar = () => dispatch({ type: 'OPEN_SIDEBAR' });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <UIContext.Provider value={{
      ...state,
      toggleSidebar,
      closeSidebar,
      openSidebar,
      setLoading,
      toggleTheme,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};