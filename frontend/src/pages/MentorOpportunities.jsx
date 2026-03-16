// src/pages/MentorOpportunities.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function MentorOpportunities() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Hackathon");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch opportunities from backend
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities");
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      const data = await res.json();
      setOpportunities(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !venue.trim() || !date.trim()) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          venue,
          date,
          time,
          registrationLink,
          postedBy: user.name, // ✅ professor name
          mentorId: user.id,   // still store ID if needed later
        }),
      });

      if (!res.ok) throw new Error("Failed to add opportunity");

      setTitle("");
      setDescription("");
      setVenue("");
      setDate("");
      setTime("");
      setRegistrationLink("");
      setType("Hackathon");
      fetchOpportunities(); // refresh list
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Mentor Opportunities</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {error && <p className="text-red-500">{error}</p>}

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Type (Category) */}
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Hackathon">Hackathon</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Conference">Conference</option>
          </select>
        </div>

        {/* Venue */}
        <div>
          <label className="block mb-1 font-medium">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block mb-1 font-medium">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Registration Link */}
        <div>
          <label className="block mb-1 font-medium">Registration Link</label>
          <input
            type="url"
            value={registrationLink}
            onChange={(e) => setRegistrationLink(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Opportunity
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-3">Existing Opportunities</h2>
      {loading ? (
        <p>Loading...</p>
      ) : opportunities.length === 0 ? (
        <p>No opportunities posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {opportunities.map((opp) => (
            <li key={opp.id} className="p-4 bg-white shadow rounded">
              <h3 className="font-semibold">{opp.title}</h3>
              <p>{opp.description}</p>
              <p className="text-sm text-gray-500">
                <strong>Type:</strong> {opp.type}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Venue:</strong> {opp.venue}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Date:</strong> {opp.date} {opp.time && `at ${opp.time}`}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Posted by:</strong> {opp.postedBy}
              </p>
              {opp.registrationLink && (
                <a
                  href={opp.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Register Here
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// // src/pages/MentorOpportunities.jsx
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";

// export default function MentorOpportunities() {
//   const { user } = useAuth();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [opportunities, setOpportunities] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch opportunities from backend
//   const fetchOpportunities = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/opportunities");
//       if (!res.ok) throw new Error("Failed to fetch opportunities");
//       const data = await res.json();
//       setOpportunities(data);
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOpportunities();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !description.trim()) return;

//     try {
//       const res = await fetch("/api/opportunities", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title,
//           description,
//           mentorId: user.id,
//           mentorName: user.name,
//         }),
//       });
//       if (!res.ok) throw new Error("Failed to add opportunity");

//       setTitle("");
//       setDescription("");
//       fetchOpportunities(); // refresh list
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Mentor Opportunities</h1>

//       <form onSubmit={handleSubmit} className="mb-6 space-y-4">
//         {error && <p className="text-red-500">{error}</p>}
//         <div>
//           <label className="block mb-1 font-medium">Title</label>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 font-medium">Description</label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Add Opportunity
//         </button>
//       </form>

//       <h2 className="text-2xl font-semibold mb-3">Existing Opportunities</h2>
//       {loading ? (
//         <p>Loading...</p>
//       ) : opportunities.length === 0 ? (
//         <p>No opportunities posted yet.</p>
//       ) : (
//         <ul className="space-y-4">
//           {opportunities.map((opp) => (
//             <li key={opp.id} className="p-4 bg-white shadow rounded">
//               <h3 className="font-semibold">{opp.title}</h3>
//               <p>{opp.description}</p>
//               <p className="text-sm text-gray-500">Posted by: {opp.mentorName}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
