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
  "student-y4": {
    id: 5,
    srn: "2025CSE005",
    username: "student5",
    role: "student",
    name: "Karan Singh",
    class: "B.Tech",
    year: 4,
    department: "CSE",
    branch: "IOT",
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
};

const FALLBACK_ROLE = "student";

function normalizeUser(userData) {
  if (!userData) return DEMO_USERS[FALLBACK_ROLE];
  return { ...userData };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? normalizeUser(JSON.parse(raw)) : DEMO_USERS[FALLBACK_ROLE];
    } catch {
      return DEMO_USERS[FALLBACK_ROLE];
    }
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const login = (userData) => setUser(normalizeUser(userData));
  const logout = () => setUser(DEMO_USERS[FALLBACK_ROLE]);

  const switchRole = (roleKey) => {
    // roleKey can be "student", "student-y4", or "recruiter"
    setUser(DEMO_USERS[roleKey] || DEMO_USERS[FALLBACK_ROLE]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;