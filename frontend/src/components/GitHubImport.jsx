import React, { useState, useMemo } from "react";

export default function GitHubImport({ userId, onImportComplete }) {
  const [username, setUsername] = useState("");
  const [phase, setPhase] = useState("input"); // input | previewing | importing | done
  const [preview, setPreview] = useState(null);
  const [selectedRepos, setSelectedRepos] = useState(new Set());
  const [langFilter, setLangFilter] = useState("All");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ── Preview ──
  const handlePreview = async () => {
    if (!username.trim()) return;
    setError(null);
    setPhase("previewing");

    try {
      const res = await fetch(`/api/github/preview/${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch GitHub profile");
      setPreview(data);
      // Auto-select repos with stars or description (likely real projects)
      const autoSelected = new Set();
      data.repos.forEach((r) => {
        if (r.stars > 0 || (r.description && r.description.length > 10)) {
          autoSelected.add(r.name);
        }
      });
      setSelectedRepos(autoSelected);
    } catch (err) {
      setError(err.message);
      setPhase("input");
    }
  };

  // ── Toggle selection ──
  const toggleRepo = (repoName) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoName)) next.delete(repoName);
      else next.add(repoName);
      return next;
    });
  };

  const selectAll = () => {
    const visible = filteredRepos.map((r) => r.name);
    setSelectedRepos(new Set(visible));
  };

  const deselectAll = () => {
    setSelectedRepos(new Set());
  };

  // ── Filter repos by language ──
  const filteredRepos = useMemo(() => {
    if (!preview?.repos) return [];
    if (langFilter === "All") return preview.repos;
    return preview.repos.filter((r) => r.language === langFilter);
  }, [preview, langFilter]);

  // ── Import selected ──
  const handleImport = async () => {
    if (selectedRepos.size === 0) return;
    setPhase("importing");
    setError(null);

    const reposToImport = preview.repos.filter((r) => selectedRepos.has(r.name));

    try {
      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          userId,
          selectedRepos: reposToImport,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      setPhase("done");
      if (onImportComplete) onImportComplete(data);
    } catch (err) {
      setError(err.message);
      setPhase("previewing");
    }
  };

  // ── Done state ──
  if (phase === "done" && result) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">✓</div>
          <div>
            <h3 className="font-bold text-emerald-800">GitHub Import Complete</h3>
            <p className="text-sm text-emerald-600">
              {result.imported} achievements imported · +{result.totalNewPoints} points
            </p>
          </div>
        </div>

        {result.overallSkills?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Skills detected</p>
            <div className="flex flex-wrap gap-1.5">
              {result.overallSkills.map((s, i) => (
                <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {result.profileSummary && (
          <p className="text-sm text-emerald-700 italic">{result.profileSummary}</p>
        )}

        <button
          onClick={() => { setPhase("input"); setPreview(null); setResult(null); setUsername(""); setSelectedRepos(new Set()); }}
          className="mt-3 text-xs text-emerald-600 hover:underline"
        >
          Import more repos
        </button>
      </div>
    );
  }

  // ── Importing state ──
  if (phase === "importing") {
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600 mx-auto" />
        <p className="mt-4 font-semibold text-violet-800">Analyzing {selectedRepos.size} selected repos...</p>
        <div className="mt-2 space-y-1 text-sm text-violet-600">
          <p>AI is extracting skills and computing points</p>
          <p>This takes about 5-10 seconds</p>
        </div>
      </div>
    );
  }

  // ── Preview + selection state ──
  if (phase === "previewing" && preview) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Profile header */}
        <div className="bg-gray-50 p-5 border-b flex items-center gap-4">
          <img
            src={preview.profile.avatarUrl}
            alt={preview.profile.login}
            className="w-14 h-14 rounded-full border-2 border-white shadow"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{preview.profile.name}</h3>
              <span className="text-sm text-gray-500">@{preview.profile.login}</span>
            </div>
            {preview.profile.bio && (
              <p className="text-sm text-gray-600 mt-0.5">{preview.profile.bio}</p>
            )}
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>{preview.profile.publicRepos} repos</span>
              <span>{preview.profile.followers} followers</span>
              <span>{preview.totalStars} total stars</span>
            </div>
          </div>
        </div>

        {/* Selection toolbar */}
        <div className="px-5 py-3 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              {selectedRepos.size} of {filteredRepos.length} selected
            </span>
            <button onClick={selectAll} className="text-xs text-violet-600 hover:underline font-medium">
              Select all
            </button>
            <button onClick={deselectAll} className="text-xs text-gray-500 hover:underline font-medium">
              Deselect all
            </button>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filter:</span>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-300"
            >
              <option value="All">All languages</option>
              {preview.languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Repo list with checkboxes */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {filteredRepos.map((r) => {
            const isSelected = selectedRepos.has(r.name);
            return (
              <label
                key={r.name}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition ${
                  isSelected ? "bg-violet-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRepo(r.name)}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 accent-violet-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-violet-900" : "text-gray-800"}`}>
                      {r.name}
                    </p>
                    {r.stars > 0 && (
                      <span className="text-xs text-amber-600 shrink-0">⭐ {r.stars}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {r.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {r.language && r.language !== "Unknown" && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {r.language}
                    </span>
                  )}
                  {r.topics?.length > 0 && (
                    <span className="text-[10px] text-gray-400">
                      {r.topics.length} tags
                    </span>
                  )}
                </div>
              </label>
            );
          })}

          {filteredRepos.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No repos match this filter
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 bg-gray-50 border-t flex items-center justify-between">
          <button
            onClick={() => { setPhase("input"); setPreview(null); setSelectedRepos(new Set()); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <button
            onClick={handleImport}
            disabled={selectedRepos.size === 0}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-sm ${
              selectedRepos.size > 0
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Import {selectedRepos.size} repo{selectedRepos.size !== 1 ? "s" : ""} as achievements →
          </button>
        </div>

        {error && (
          <div className="px-5 py-3 bg-rose-50 text-rose-700 text-sm border-t border-rose-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ── Input state ──
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Import from GitHub</h3>
          <p className="text-sm text-gray-500">Choose which repos to import as achievements</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            github.com/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePreview()}
            placeholder="username"
            className="w-full pl-24 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
          />
        </div>
        <button
          onClick={handlePreview}
          disabled={!username.trim()}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition ${
            username.trim()
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Preview
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <p className="mt-3 text-xs text-gray-400">
        Fetches your public repos. You'll choose which ones to import. AI analyzes each selected repo and extracts skills.
      </p>
    </div>
  );
}