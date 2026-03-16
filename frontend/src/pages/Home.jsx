import React, { useEffect, useState } from "react";

export default function Home() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // pastel gradient backgrounds for cards
  const pastelGradients = [
    "bg-gradient-to-br from-pink-100 to-pink-200",
    "bg-gradient-to-br from-blue-100 to-blue-200",
    "bg-gradient-to-br from-green-100 to-green-200",
    "bg-gradient-to-br from-yellow-100 to-yellow-200",
    "bg-gradient-to-br from-purple-100 to-purple-200",
    "bg-gradient-to-br from-orange-100 to-orange-200",
  ];

  useEffect(() => {
    fetch("/api/home")
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data.suggestions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Loading daily ideas...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {suggestions.map((s, idx) => (
        <div
          key={idx}
          className={`shadow-md rounded-2xl p-4 cursor-pointer text-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl ${
            pastelGradients[idx % pastelGradients.length]
          }`}
          onClick={() => setSelected(s)}
        >
          <h2 className="text-xl font-bold">{s.title}</h2>
          <p className="text-sm text-gray-700">{s.category}</p>
          <p className="mt-2">{s.shortDescription}</p>
        </div>
      ))}

      {/* Modal for Details */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 max-w-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSelected(null)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
            <p className="text-sm text-gray-500">{selected.category}</p>
            <p className="mt-3">{selected.details}</p>
            {selected.link && (
              <a
                href={selected.link}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Learn More →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

