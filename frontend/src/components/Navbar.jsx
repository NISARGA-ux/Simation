import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Map user details safely
      const formatted = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        domain: item.domain,
        userName: item.userName || "Unknown",
        year: item.year || "",
        userId: item.userId
      }));

      setResults(formatted);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="p-4 flex justify-between items-center relative bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200 shadow-md">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="text-xl text-gray-800 p-2 rounded hover:bg-gray-100"
      >
        ☰
      </button>

      {/* Search bar */}
      <div ref={containerRef} className="flex-1 mx-4 relative">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search achievements..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-800 placeholder-gray-600"
          />
        </form>

        {showResults && (
          <div className="absolute z-50 w-full mt-2 max-h-96 overflow-auto bg-white rounded-lg shadow-lg">
            {loading ? (
              <div className="p-4 text-gray-600">Loading...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-gray-600">No results found</div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/profile/${item.userId}`)}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{item.description}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4 text-xs text-purple-600">
                    {item.userName} {item.year && `- Year ${item.year}`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Brand */}
      <h1
        className="font-bold text-xl cursor-pointer text-gray-800"
        onClick={() => navigate("/")}
      >
        Zenith Cortex
      </h1>
    </nav>
  );
}


// import React, { useState } from "react";

// export default function Navbar({ toggleSidebar }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     try {
//       const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
//       const data = await res.json();
//       setResults(data);
//     } catch (err) {
//       console.error("Search error:", err);
//     }
//   };

//   return (
//     <nav className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-4 flex items-center justify-between shadow-md relative">
//       {/* Sidebar toggle */}
//       <button
//         onClick={toggleSidebar}
//         className="p-2 bg-white rounded-md shadow hover:bg-gray-100"
//       >
//         ☰
//       </button>

//       {/* Search bar */}
//       <form
//         onSubmit={handleSearch}
//         className="flex items-center mx-4 flex-1 max-w-lg"
//       >
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search achievements..."
//           className="flex-1 p-2 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:outline-none shadow"
//         />
//         <button
//           type="submit"
//           className="bg-blue-300 text-white px-4 rounded-r-lg hover:bg-purple-600 shadow"
//         >
//           Search
//         </button>
//       </form>

//       {/* Brand (right side) */}
//       <h1 className="font-bold italic text-3xl text-blue-900">Zenith Cortex</h1>

//       {/* Search results dropdown */}
//       {results.length > 0 && (
//         <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-xl bg-white border rounded-lg shadow-lg p-2 max-h-72 overflow-y-auto">
//           {results.map((item) => (
//             <div
//               key={item.id}
//               className="p-3 border-b hover:bg-gray-50 cursor-pointer"
//             >
//               <h3 className="font-semibold text-gray-800">{item.title}</h3>
//               <p className="text-sm text-gray-600 truncate">{item.description}</p>
//               <span className="text-xs text-purple-600">{item.domain}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </nav>
//   );
// }



