import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/lms";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, role: UserRole) => Promise<void>;
  sendSignupOtp: (userData: any) => Promise<void>; 
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth` 
  : (import.meta.env.MODE === 'production' ? '/api/auth' : "http://localhost:5000/api/auth");
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = () => {
      const storedUser = localStorage.getItem("library_user");
      const token = localStorage.getItem("library_token");

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // 🛠️ Ensure both id and _id exist for seamless frontend compatibility
          const standardizedUser = {
            ...parsedUser,
            id: parsedUser.id || parsedUser._id,
            _id: parsedUser._id || parsedUser.id
          };

          setUser(standardizedUser);
        } catch (error) {
          console.error("AuthContext: LocalStorage parse error", error);
          localStorage.removeItem("library_user");
          localStorage.removeItem("library_token");
        }
      }
      setIsLoading(false);
    };
    checkLogin();
  }, []);

  const login = async (identifier: string, password: string, role: UserRole) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Safe Data Standardization (MongoDB _id ko id ke sath map karna taaki kahin conflict na ho)
      const rawUser = data.user;
      const userId = rawUser._id || rawUser.id;

      const userData = {
        ...rawUser,
        id: userId,
        _id: userId,
        ...(rawUser.course && { course: rawUser.course.toUpperCase() }),
        ...(rawUser.branch && { branch: rawUser.branch.toUpperCase() }),
        year: rawUser.year || null
      };

      localStorage.setItem("library_token", data.token);
      localStorage.setItem("library_user", JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      throw error; 
    }
  };

  const sendSignupOtp = async (userData: any) => {
    try {
      const role = userData.role || "student"; 
      
      const response = await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");
      
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const role = userData.role || "student"; 
      
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    setUser(null);
    window.location.href = "/login"; 
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isAdmin, 
      isLoading, 
      login, 
      sendSignupOtp, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
