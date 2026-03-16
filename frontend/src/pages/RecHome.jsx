import React from "react";

export default function RecHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Recruiter Dashboard</h1>
      <p>Welcome, Recruiter! From here you can:</p>

      <ul className="list-disc ml-6 mt-3 space-y-2">
        <li>Take the recruiter quiz (RecQuiz) to specify the skills you want.</li>
        <li>Use filters / AI matching (coming soon) to find students.</li>
        <li>View leaderboard and recruiter profile (logout).</li>
      </ul>
    </div>
  );
}
