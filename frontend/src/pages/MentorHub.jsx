// frontend/src/pages/MentorHub.jsx
import React, { useEffect, useState } from "react";

export default function MentorHome() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data) => setOpportunities(data))
      .catch((err) => console.error("Error fetching opportunities:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-10">
        Upcoming Opportunities ✨
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.length > 0 ? (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white/80 shadow-md rounded-2xl p-6 border border-purple-100
                         hover:shadow-xl transition duration-200 ease-in-out"
            >
              <h2 className="text-xl font-semibold text-purple-800 mb-2">
                {opp.title}
              </h2>
              <p className="text-gray-700 mb-3">{opp.description}</p>

              <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                <span>
                  <strong>Type:</strong> {opp.type}
                </span>
                <span>
                  <strong>Venue:</strong> {opp.venue}
                </span>
                <span>
                  <strong>Date:</strong>{" "}
                  {new Date(opp.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <a
                href={opp.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-pink-400 to-purple-400 
                           text-white text-sm px-4 py-2 rounded-full shadow-md
                           hover:from-pink-500 hover:to-purple-500 transition"
              >
                Register Now
              </a>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No opportunities posted yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
