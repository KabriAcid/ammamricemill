import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, AuthState } from "../types";
import { api, ApiError, setUnauthorizedHandler } from "../utils/fetcher";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type LoginResponse = ApiResponse<LoginResponseData>;

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

  // Set up unauthorized response handler
  useEffect(() => {
    const handleUnauthorized = async () => {
      console.log("Unauthorized response detected, logging out...");
      try {
        await logout();
        // Don't navigate here - let the protected route handle it
      } catch (error) {
        console.error("Error during auto-logout:", error);
      }
    };

    setUnauthorizedHandler(handleUnauthorized);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // First try to get the stored user
      const storedUser = localStorage.getItem("ammam_user");

      if (!storedUser) {
        dispatch({ type: "SET_USER", payload: null });
        return;
      }

      // Verify token with backend
      try {
        const response = await api.get<ApiResponse>("/auth/verify");
        if (response.data.success) {
          const user = JSON.parse(storedUser);
          dispatch({ type: "SET_USER", payload: user });
        } else {
          // If verification fails, clear stored data
          localStorage.removeItem("ammam_user");
          dispatch({ type: "SET_USER", payload: null });
        }
      } catch (err) {
        // If verification request fails, clear stored data
        localStorage.removeItem("ammam_user");
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error) {
      localStorage.removeItem("ammam_user");
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }

      const { user } = response.data;

      dispatch({ type: "SET_USER", payload: user });

      // Store user info and token in localStorage
      localStorage.setItem(
        "ammam_user",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: response.data.accessToken,
        })
      );
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Call backend logout endpoint
      const response = await api.post<ApiResponse>("/auth/logout", {});

      if (!response.success) {
        throw new Error(response.message || "Logout failed");
      }

      // Clear local storage
      localStorage.removeItem("ammam_user");

      // Clear state
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage and state even if API call fails
      localStorage.removeItem("ammam_user");
      dispatch({ type: "LOGOUT" });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
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
