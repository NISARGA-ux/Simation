import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    branch: "",
    year: "",
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("/api/leaderboard", {
          params: filters,
        });
        setLeaderboard(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Leaderboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          name="department"
          value={filters.department}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ME">ME</option>
          <option value="ECE">ECE</option>
          
        </select>

        <select
          name="branch"
          value={filters.branch}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="AIML">AI ML</option>
          <option value="AIDS">AI DS</option>
          <option value="IOT">IOT</option>
          <option value="Communication Networks">Communitcation networks</option>
          <option value="Robotics">Robotics</option>
          <option value="Aerospace">Aerospace</option>
          <option value="Mechatronics">Mechatronics</option>
          <option value="VLSI designing">VLSI Designing</option>
        </select>

        <select
          name="year"
          value={filters.year}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <p className="text-gray-500">No students found for these filters.</p>
      ) : (
        <table className="w-full border-collapse shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Rank</th>
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Year</th>
              <th className="p-3">Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold text-blue-600">
                  {getMedal(student.rank)}
                </td>
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.department}</td>
                <td className="p-3">{student.branch}</td>
                <td className="p-3">{student.year}</td>
                <td className="p-3 font-semibold">{student.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
