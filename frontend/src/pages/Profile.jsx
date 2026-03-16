import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import GitHubImport from "../components/GitHubImport";

export default function Profile() {
  const { user, logout } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await axios.get(`/api/achievements/${user.id}`);
        setAchievements(res.data);
        const points = res.data.reduce((sum, a) => sum + (a.points || 0), 0);
        setTotalPoints(points);
      } catch (err) {
        console.error("Error fetching achievements:", err);
      }
    };
    if (user?.id) fetchAchievements();
  }, [user]);

  // Add achievement
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    formData.append("userId", user.id);
    if (file) formData.append("proofFile", file);

    try {
      const res = await axios.post("/api/achievements/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAchievements((prev) => [...prev, res.data.achievement]);
      setTotalPoints((prev) => prev + (res.data.achievement.points || 0));
      setTitle("");
      setDescription("");
      setLink("");
      setFile(null);
      setCategory("");
    } catch (err) {
      console.error("Error adding achievement:", err);
      alert(err.response?.data?.message || "Failed to add achievement");
    }
  };

  // After GitHub import, refresh achievements
  const handleGitHubImport = (importResult) => {
    if (importResult?.achievements) {
      setAchievements((prev) => [...prev, ...importResult.achievements]);
      setTotalPoints((prev) => prev + (importResult.totalNewPoints || 0));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {user.srn} · {user.department} · {user.branch} · Year {user.year}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-violet-600 font-mono">{totalPoints}</p>
                <p className="text-xs text-gray-500">total points</p>
              </div>
              <button
                onClick={logout}
                className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* GitHub Import — THE WOW MOMENT */}
        <GitHubImport userId={user.id} onImportComplete={handleGitHubImport} />

        {/* Manual add achievement */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Add Achievement Manually</h2>
          <form onSubmit={handleAddAchievement} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Achievement title"
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (max 1000 chars)"
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              maxLength={1000}
              rows={3}
              required
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="">Select Category (optional)</option>
              <option>Project</option>
              <option>Hackathon</option>
              <option>Course</option>
              <option>Certification</option>
              <option>Internship</option>
              <option>Workshop</option>
              <option>Publication</option>
              <option>Competition</option>
              <option>Research</option>
              <option>Volunteering</option>
            </select>

            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Proof link — GitHub / LinkedIn / Certificate URL (optional)"
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm"
            />
            <button
              type="submit"
              className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
            >
              Add Achievement
            </button>
          </form>
        </div>

        {/* Achievements list */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4">
            My Achievements ({achievements.length})
          </h2>
          {achievements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400">No achievements yet. Import from GitHub or add manually above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                    <span className="text-xs font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full ml-2 shrink-0">
                      {a.points || 0} pts
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>

                  {/* Skill tags */}
                  {a.skillTags && a.skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.skillTags.slice(0, 6).map((t, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Source badge */}
                  {a.source === "github-import" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      Imported from GitHub
                    </span>
                  )}

                  {/* Proof link */}
                  {a.proof && (
                    <div className="mt-2">
                      {a.proof.startsWith("http") ? (
                        <a
                          href={a.proof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-violet-600 hover:underline"
                        >
                          View proof →
                        </a>
                      ) : a.proof.startsWith("/uploads") ? (
                        <a
                          href={a.proof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-violet-600 hover:underline"
                        >
                          View attachment →
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}