import React from "react";
import { useAuth } from "../context/AuthContext";

export default function MentorProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mentor Profile</h1>

      {user ? (
        <div className="space-y-4">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> {user.role}</p>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>No mentor logged in.</p>
      )}
    </div>
  );
}
