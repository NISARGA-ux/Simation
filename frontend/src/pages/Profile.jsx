import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user, logout } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [rank, setRank] = useState("");
  const [level, setLevel] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await axios.get(
          `/api/achievements/${user.id}`
        );
        setAchievements(res.data);
        const points = res.data.reduce((sum, a) => sum + (a.points || 0), 0);
        setTotalPoints(points);
      } catch (err) {
        console.error("Error fetching achievements:", err);
      }
    };

    if (user?.id) {
      fetchAchievements();
    }
  }, [user]);

  // Add achievement
  const handleAddAchievement = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    formData.append("userId", user.id);
    if (file) {
      formData.append("proofFile", file);
    }

    try {
      const res = await axios.post(
        "/api/achievements/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAchievements((prev) => [...prev, res.data.achievement]);
      setTotalPoints((prev) => prev + (res.data.achievement.points || 0));

      // reset form
      setTitle("");
      setDescription("");
      setLink("");
      setFile(null);
    } catch (err) {
  if (err.response) {
    console.error("Server responded with:", err.response.status, err.response.data);
    alert(`Error: ${err.response.data.message || "Something went wrong"}`);
  } else if (err.request) {
    console.error("No response received:", err.request);
  } else {
    console.error("Error setting up request:", err.message);
  }
}

  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="mb-6 space-y-1">
        <p>
          <strong>SRN:</strong> {user.srn}
        </p>
        <p>
          <strong>Class:</strong> {user.class}
        </p>
        <p>
          <strong>Year:</strong> {user.year}
        </p>
        <p>
          <strong>Department:</strong> {user.department}
        </p>
        <p>
          <strong>Branch:</strong> {user.branch}
        </p>
        <p>
          <strong>Total Points:</strong> {totalPoints}
        </p>
      </div>

      {/* Add Achievement */}
      <h2 className="text-xl font-semibold mb-2">Add Achievement</h2>
      <form onSubmit={handleAddAchievement} className="space-y-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (max 1000 chars)"
          className="w-full border p-2 rounded"
          maxLength={1000}
          required
        />

           Category selector
//           <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-3 rounded"
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

          {/* Extra fields for Hackathon / Competition */}
          {(category === "Hackathon" || category === "Competition") && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="Rank (e.g. Winner, Runner-up, Top 10)"
                className="border p-3 rounded"
              />
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Level (Local, State, National, International)"
                className="border p-3 rounded"
              />
            </div>
          )}

        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="GitHub / LinkedIn / Vercel / Certificate Link (optional)"
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Achievement
        </button>
      </form>

      {/* My Achievements */}
      <h2 className="text-xl font-semibold mb-2">My Achievements</h2>
      {achievements.length === 0 ? (
        <p>No achievements added yet.</p>
      ) : (
        <ul className="space-y-4">
          {achievements.map((a) => (
            <li key={a.id} className="border p-4 rounded">
              <h3 className="font-bold">{a.title}</h3>
              <p>{a.description}</p>
              {a.proof && (
                <div className="mt-2">
                  {a.proof.startsWith("http") ? (
                    <a
                      href={a.proof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {a.proof}
                    </a>
                  ) : (
                    <img
                      src={`${a.proof}`}
                      alt="Proof"
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Points: {a.points || 0}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";

// export default function Profile() {
//   const { user, logout } = useAuth();
//   const [achievements, setAchievements] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [link, setLink] = useState("");
//   const [file, setFile] = useState(null);
//   const [category, setCategory] = useState("");
//   const [rank, setRank] = useState("");
//   const [level, setLevel] = useState("");
//   const [totalPoints, setTotalPoints] = useState(0);

//   // Fetch achievements
//   useEffect(() => {
//     const fetchAchievements = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/achievements/${user.id}/achievements`
//         );
//         setAchievements(res.data);
//         const points = res.data.reduce((sum, a) => sum + (a.score || 0), 0);
//         setTotalPoints(points);
//       } catch (err) {
//         console.error("Error fetching achievements:", err);
//       }
//     };

//     if (user?.id) fetchAchievements();
//   }, [user]);

//   // Add achievement
//   const handleAddAchievement = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("link", link);
//     formData.append("userId", user.id);
//     if (category) formData.append("category", category);
//     if (rank) formData.append("rank", rank);
//     if (level) formData.append("level", level);
//     if (file) formData.append("proofFile", file);

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/achievements/addAchievement",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       setAchievements((prev) => [...prev, res.data.achievement]);
//       setTotalPoints((prev) => prev + (res.data.achievement.score || 0));

//       // reset form
//       setTitle("");
//       setDescription("");
//       setLink("");
//       setFile(null);
//       setCategory("");
//       setRank("");
//       setLevel("");
//     } catch (err) {
//       console.error("Error adding achievement:", err);
//       alert("Failed to add achievement.");
//     }
//   };

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
//         <button
//           onClick={logout}
//           className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow"
//         >
//           Logout
//         </button>
//       </div>

//       {/* User Info */}
//       <div className="bg-gray-100 p-6 rounded-xl shadow mb-8">
//         <h2 className="text-xl font-semibold mb-3 text-gray-700">Profile Info</h2>
//         <div className="grid grid-cols-2 gap-3 text-gray-800">
//           <p><strong>SRN:</strong> {user.srn}</p>
//           <p><strong>Class:</strong> {user.class}</p>
//           <p><strong>Year:</strong> {user.year}</p>
//           <p><strong>Department:</strong> {user.department}</p>
//           <p><strong>Branch:</strong> {user.branch}</p>
//           <p><strong>Total Points:</strong> {totalPoints}</p>
//         </div>
//       </div>

//       {/* Add Achievement */}
//       <div className="bg-white p-6 rounded-xl shadow mb-8">
//         <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Achievement</h2>
//         <form onSubmit={handleAddAchievement} className="space-y-4">
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Title"
//             className="w-full border p-3 rounded"
//             required
//           />
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Description (max 1000 chars)"
//             className="w-full border p-3 rounded"
//             maxLength={1000}
//             required
//           />

//           {/* Category selector */}
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="w-full border p-3 rounded"
//           >
//             <option value="">Select Category (optional)</option>
//             <option>Project</option>
//             <option>Hackathon</option>
//             <option>Course</option>
//             <option>Certification</option>
//             <option>Internship</option>
//             <option>Workshop</option>
//             <option>Publication</option>
//             <option>Competition</option>
//             <option>Research</option>
//             <option>Volunteering</option>
//           </select>

//           {/* Extra fields for Hackathon / Competition */}
//           {(category === "Hackathon" || category === "Competition") && (
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 value={rank}
//                 onChange={(e) => setRank(e.target.value)}
//                 placeholder="Rank (e.g. Winner, Runner-up, Top 10)"
//                 className="border p-3 rounded"
//               />
//               <input
//                 type="text"
//                 value={level}
//                 onChange={(e) => setLevel(e.target.value)}
//                 placeholder="Level (Local, State, National, International)"
//                 className="border p-3 rounded"
//               />
//             </div>
//           )}

//           <input
//             type="text"
//             value={link}
//             onChange={(e) => setLink(e.target.value)}
//             placeholder="GitHub / LinkedIn / Certificate Link (optional)"
//             className="w-full border p-3 rounded"
//           />

//           <input
//             type="file"
//             onChange={(e) => setFile(e.target.files[0])}
//             className="w-full border p-3 rounded"
//           />

//           <button
//             type="submit"
//             className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
//           >
//             Add Achievement
//           </button>
//         </form>
//       </div>

//       {/* Achievements */}
//       <div>
//         <h2 className="text-xl font-semibold mb-4 text-gray-700">My Achievements</h2>
//         {achievements.length === 0 ? (
//           <p className="text-gray-500">No achievements added yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {achievements.map((a) => (
//               <div key={a.id} className="border rounded-xl p-5 shadow bg-white">
//                 <h3 className="text-lg font-bold text-gray-800">{a.title}</h3>
//                 <p className="text-gray-600">{a.description}</p>
//                 <p className="mt-2 text-sm text-blue-600 font-medium">
//                   Category: {a.category} | Score: {a.score}
//                 </p>
//                 {a.reasoning && (
//                   <p className="text-xs text-gray-500 italic">
//                     AI reasoning: {a.reasoning}
//                   </p>
//                 )}
//                 {a.proof && (
//                   <div className="mt-3">
//                     {a.proof.startsWith("http") ? (
//                       <a
//                         href={a.proof}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-blue-600 underline"
//                       >
//                         View Proof
//                       </a>
//                     ) : (
//                       <img
//                         src={`http://localhost:5000${a.proof}`}
//                         alt="Proof"
//                         className="w-32 h-32 object-cover rounded mt-2"
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
