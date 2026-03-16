import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = {
  student: {
    id: 1,
    srn: "2025CSE001",
    username: "student1",
    role: "student",
    name: "Preeti Kapoor",
    class: "B.Tech",
    year: 2,
    department: "CSE",
    branch: "AIML",
    company: null,
  },
  recruiter: {
    id: 1,
    username: "recruiter1",
    role: "recruiter",
    name: "Pankaj Tripati",
    company: "TechCorp",
    srn: null,
    class: null,
    year: null,
    department: null,
    branch: null,
  },
  faculty: {
    id: 1,
    username: "mentor1",
    role: "faculty",
    name: "Dr. Arjun Mehta",
    company: null,
    srn: null,
    class: null,
    year: null,
    department: "Computer Science",
    branch: null,
  },
};

const FALLBACK_ROLE = "student";

function normalizeUser(userData) {
  if (!userData) {
    return DEMO_USERS[FALLBACK_ROLE];
  }

  const roleKey =
    userData.role === "mentor" || userData.role === "faculty"
      ? "faculty"
      : userData.role === "recruiter"
        ? "recruiter"
        : "student";

  return {
    ...DEMO_USERS[roleKey],
    ...userData,
    role: roleKey === "faculty" ? "faculty" : roleKey,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? normalizeUser(JSON.parse(raw)) : DEMO_USERS[FALLBACK_ROLE];
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return DEMO_USERS[FALLBACK_ROLE];
    }
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const login = (userData) => {
    setUser(normalizeUser(userData));
  };

  const logout = () => {
    setUser(DEMO_USERS[FALLBACK_ROLE]);
  };

  const switchRole = (role) => {
    setUser(DEMO_USERS[role] || DEMO_USERS[FALLBACK_ROLE]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
