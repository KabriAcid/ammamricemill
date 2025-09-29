import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, AuthState } from "../types";
import { api, ApiError } from "../utils/fetcher";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };
    case "LOGOUT":
      return { user: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // For development - check if user is stored in localStorage
      const storedUser = localStorage.getItem("ammam_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: "SET_USER", payload: user });
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error) {
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // For development - accept any email/password combination
      // In production, this should call your actual API
      if (email && password) {
        // Mock user data for development
        const mockUser: User = {
          id: 23,
          name: "ADAM CHEKO",
          email: email,
          role: "Admin",
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        dispatch({ type: "SET_USER", payload: mockUser });

        // Store user in localStorage for development
        localStorage.setItem("ammam_user", JSON.stringify(mockUser));
      } else {
        throw new Error("Please enter both email and password");
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // For development - just clear localStorage
      localStorage.removeItem("ammam_user");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      dispatch({ type: "SET_USER", payload: { ...state.user, ...userData } });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
