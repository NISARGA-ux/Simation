import React, { useState } from "react";
import recQuestionsRaw from "../data/rec.questions.json";

export default function RecQuiz() {
  const recQuestions = Array.isArray(recQuestionsRaw) ? recQuestionsRaw : [];
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle multi-select answers
  const handleChange = (qid, option) => {
    setAnswers((prev) => {
      const current = prev[qid] || [];
      if (current.includes(option)) {
        return { ...prev, [qid]: current.filter((o) => o !== option) };
      } else {
        return { ...prev, [qid]: [...current, option] };
      }
    });
  };

  // Handle text input answers
  const handleTextChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: [value] }));
  };

  // Analyse API call
  const handleAnalyse = async () => {
    const selectedAnswers = Object.values(answers).flat();
    console.log("🔎 Analyse clicked - sending:", selectedAnswers);

    if (!selectedAnswers.length) {
      alert("Please select at least one filter.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/recquiz/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", res.status, text);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("=> analyse response:", data);
      setResults(data.matches || []);
    } catch (err) {
      console.error("Error analysing:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Recruiter Quiz</h1>

      {/* Quiz Questions */}
      <div className="space-y-6">
        {recQuestions.length > 0 ? (
          recQuestions.map((q, idx) => (
            <div key={idx} className="p-4 rounded-2xl shadow-md bg-pink-50">
              <h2 className="text-lg font-semibold mb-3">{q.question}</h2>

              {/* Multi-select */}
              {q.type === "multi-select" && (
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer bg-white hover:bg-pink-100 transition"
                    >
                      <input
                        type="checkbox"
                        checked={answers[q.id]?.includes(opt) || false}
                        onChange={() => handleChange(q.id, opt)}
                        className="h-4 w-4 accent-pink-400"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Text Input */}
              {q.type === "text" && (
                <input
                  type="text"
                  placeholder="Type preferred skills/keywords (e.g., AWS, IoT)"
                  value={answers[q.id]?.[0] || ""}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400"
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recruiter questions found.</p>
        )}
      </div>

      {/* Analyse Button */}
      <button
        onClick={handleAnalyse}
        disabled={loading}
        className="w-full py-3 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-md transition"
      >
        {loading ? "Analysing..." : "Analyse"}
      </button>

      {/* Results */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Matching Students:</h2>
        {results.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {results.map((student, idx) => (
              <li
                key={idx}
                className="p-4 rounded-xl bg-green-50 shadow flex flex-col"
              >
                <span className="font-bold">{student.name}</span>
                <span className="text-sm text-gray-600">
                  {student.department} • Year {student.year}
                </span>

                {/* Show achievements with description */}
                {Array.isArray(student.matchedAchievements) &&
                  student.matchedAchievements.length > 0 && (
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Matched Achievements:
                      </h3>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {student.matchedAchievements.map((ach, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            <div>
                              <span className="font-medium">{ach.title}</span>
                              {ach.description && (
                                <span> — {ach.description}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ach.domain || "General"} • {ach.points || 0} pts
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-500">No matches yet.</p>
        )}
      </div>
    </div>
  );
}


// import React, { useState } from "react";
// import recQuestionsRaw from "../data/rec.questions.json";

// export default function RecQuiz() {
//   const recQuestions = Array.isArray(recQuestionsRaw) ? recQuestionsRaw : [];
//   const [answers, setAnswers] = useState({});
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (qid, option) => {
//     setAnswers(prev => {
//       const current = prev[qid] || [];
//     if (current.includes(option)) {
//       return { ...prev, [qid]: current.filter(o => o !== option) };
//     } else {
//       return { ...prev, [qid]: [...current, option] };
//     }
//     });
//   };

//   const handleTextChange = (qid, value) => {
//     setAnswers(prev => ({ ...prev, [qid]: [value] }));
//   };

//   const handleAnalyse = async () => {
//   const selectedAnswers = Object.values(answers).flat();
//   console.log("🔎 Analyse clicked - sending:", selectedAnswers);

//   if (!selectedAnswers.length) {
//     alert("Please select at least one filter.");
//     return;
//   }

//   try {
//     setLoading(true);
//     const res = await fetch("http://localhost:5000/api/recquiz/analyse", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ answers: selectedAnswers }),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       console.error("Server error:", res.status, text);
//       setLoading(false);
//       return;
//     }

//     const data = await res.json();
//     console.log("=> analyse response:", data);
//     setResults(data.matches || []);
//   } catch (err) {
//     console.error("Error analysing:", err);
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
// <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold text-center">Recruiter Quiz</h1>

//       {/* Quiz Questions */}
//       <div className="space-y-6">
//         {recQuestions.length > 0 ? (
//           recQuestions.map((q, idx) => (
//             <div key={idx} className="p-4 rounded-2xl shadow-md bg-pink-50">
//               <h2 className="text-lg font-semibold mb-3">{q.question}</h2>

//               {q.type === "multi-select" && (
//                 <div className="space-y-2">
//                   {q.options.map((opt, oIdx) => (
//                     <label
//                       key={oIdx}
//                       className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer bg-white hover:bg-pink-100 transition"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={answers[q.id]?.includes(opt) || false}
//                         onChange={() => handleChange(q.id, opt)}
//                         className="h-4 w-4 accent-pink-400"
//                       />
//                       <span>{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               )}

//               {q.type === "text" && (
//                 <input
//                   type="text"
//                   placeholder="Type preferred skills/keywords (e.g., AWS, IoT)"
//                   value={answers[q.id]?.[0] || ""}
//                   onChange={e => handleTextChange(q.id, e.target.value)}
//                   className="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400"
//                 />
//               )}
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500">No recruiter questions found.</p>
//         )}
//       </div>

//       {/* Analyse Button */}
//       <button
//   onClick={handleAnalyse}
//   disabled={loading}
//   className="w-full py-3 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-md transition"
// >
//   {loading ? "Analysing..." : "Analyse"}
// </button>


//       {/* Results */}
//       <div className="mt-6">
//         <h2 className="text-xl font-semibold">Matching Students:</h2>
//         {results.length > 0 ? (
//           <ul className="mt-3 space-y-3">
//             {results.map((student, idx) => (
//               <li
//                 key={idx}
//                 className="p-4 rounded-xl bg-green-50 shadow flex flex-col"
//               >
//                 <span className="font-bold">{student.name}</span>
//                 <span className="text-sm text-gray-600">
//                   {student.department} • Year {student.year}
//                 </span>

//                 {/* Show achievements if available */}
//                 {student.matchedAchievements && student.matchedAchievements.length > 0 && (
//                   <div className="mt-3">
//                     <h3 className="text-sm font-semibold text-gray-700">
//                       Matched Achievements:
//                     </h3>
//                     <ul className="mt-1 list-disc list-inside space-y-1">
//                       {student.matchedAchievements.map((ach, i) => (
//                         <li key={i} className="text-sm text-gray-700">
//                           <span className="font-medium">{ach.title}</span> —{" "}
//                           {ach.description}
//                           <div className="text-xs text-gray-500">
//                             {ach.domain} • {ach.points} pts
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="mt-3 text-gray-500">No matches yet.</p>
//         )}
//       </div>
//     </div>
//  );
// } 




// [
//   {
//     "id": 1,
//     "question": "Which branch(es) are you hiring from?",
//     "type": "multi-select",
//     "options": ["Computer Science (CSE)", "Information Technology (IT)", "Electronics and Communication (ECE)", "Electrical Engineering (EE)", "Mechanical Engineering (ME)", "Civil Engineering (CE)", "Other"]
//   },
//   {
//     "id": 2,
//     "question": "Which role(s) are you hiring for?",
//     "type": "multi-select",
//     "options": ["Backend Developer", "Frontend Developer", "Full Stack Developer", "AI/ML Engineer", "Cybersecurity Engineer", "Data Scientist", "IoT Engineer", "Embedded Systems Engineer", "VLSI Engineer", "Robotics Engineer", "Automobile Engineer", "Design Engineer (CAD/CAE)", "Production Engineer", "Other"]
//   },
//   {
//     "id": 3,
//     "question": "Which programming languages are must-have?",
//     "type": "multi-select",
//     "options": ["Python", "JavaScript", "Java", "C++", "C", "MATLAB", "Verilog/VHDL", "Go", "Rust", "Other"]
//   },
//   {
//     "id": 4,
//     "question": "Which tools/technologies are required?",
//     "type": "multi-select",
//     "options": ["React", "Angular", "Node.js", "Django", "Flask", "TensorFlow", "PyTorch", "ROS (Robotics)", "ANSYS", "AutoCAD", "SolidWorks", "MATLAB/Simulink", "PCB Design Tools (Altium, KiCAD)", "Other"]
//   },
//   {
//     "id": 5,
//     "question": "Which domain expertise are you looking for?",
//     "type": "multi-select",
//     "options": ["Web Development", "Mobile Development", "Cloud Computing", "Cybersecurity", "AI/ML", "IoT", "VLSI/Chip Design", "Embedded Systems", "Robotics", "Automobile Engineering", "Thermal/Fluid Mechanics", "Structural Engineering", "Other"]
//   },
//   {
//     "id": 6,
//     "question": "Preferred level of education?",
//     "type": "multi-select",
//     "options": ["Any", "B.Tech/B.E.", "M.Tech/M.E.", "PhD", "Diploma", "Other"]
//   },
//   {
//     "id": 7,
//     "question": "Which types of projects are most relevant?",
//     "type": "multi-select",
//     "options": ["Web Apps", "Mobile Apps", "AI/ML Models", "Data Pipelines", "Cybersecurity Tools", "IoT Systems", "Robotics Projects", "Embedded Hardware", "Mechanical CAD/CAE Designs", "Automobile/EV Projects", "Other"]
//   },
//   {
//     "id": 8,
//     "question": "Are hackathon achievements important?",
//     "type": "multi-select",
//     "options": ["Winners only", "Finalists", "Multiple Participants", "Not important"]
//   },
//   {
//     "id": 9,
//     "question": "Are workshop/certification completions important?",
//     "type": "multi-select",
//     "options": ["AI/ML Workshops", "Cybersecurity Certifications", "Cloud Certifications (AWS/GCP/Azure)", "Robotics/IoT Bootcamps", "Mechanical Design/CAE Certifications", "Electronics/VLSI Trainings", "Not important"]
//   },
//   {
//     "id": 10,
//     "question": "What minimum leaderboard percentile should candidates be in?",
//     "type": "single-select",
//     "options": ["Top 1%", "Top 5%", "Top 10%", "Top 25%", "Any"]
//   },
//   {
//     "id": 11,
//     "question": "How important are research papers/publications?",
//     "type": "single-select",
//     "options": ["Very important", "Somewhat important", "Not important"]
//   },
//   {
//     "id": 12,
//     "question": "Do you require internship/industry experience?",
//     "type": "single-select",
//     "options": ["Yes, at least 1 internship", "Yes, at least 2 internships", "Preferred but not required", "No"]
//   },
//   {
//     "id": 13,
//     "question": "Preferred soft skills?",
//     "type": "multi-select",
//     "options": ["Leadership", "Team Collaboration", "Problem Solving", "Communication", "Adaptability", "Time Management", "Critical Thinking", "Other"]
//   },
//   {
//     "id": 14,
//     "question": "Are you open to remote candidates?",
//     "type": "single-select",
//     "options": ["Yes", "No", "Hybrid/Depends"]
//   },
//   {
//     "id": 15,
//     "question": "Do you want candidates with startup/entrepreneurship experience?",
//     "type": "single-select",
//     "options": ["Yes", "No", "Preferred but not required"]
//   },
//   {
//     "id": 16,
//     "question": "Do you require candidates with open-source contributions?",
//     "type": "single-select",
//     "options": ["Yes", "Preferred", "Not important"]
//   },
//   {
//     "id": 17,
//     "question": "Expected candidate availability?",
//     "type": "single-select",
//     "options": ["Immediate", "1–3 months", "3–6 months", "Any"]
//   },
//   {
//     "id": 18,
//     "question": "What is the priority order of selection criteria?",
//     "type": "multi-select",
//     "options": ["Skills", "Projects", "Hackathons", "Leaderboard Rank", "Workshops/Certifications", "Research Papers", "Internships", "Soft Skills"]
//   },
//   {
//     "id": 19,
//     "question": "Expected job location(s)?",
//     "type": "multi-select",
//     "options": ["India", "Remote", "US", "Europe", "Middle East", "Other"]
//   },
//   {
//     "id": 20,
//     "question": "Other specific requirements (free text)?",
//     "type": "text"
//   }
// ]


