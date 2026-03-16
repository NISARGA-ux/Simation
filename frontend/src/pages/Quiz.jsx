import React, { useState, useEffect } from "react";
import quizQuestions from "../data/quiz.questions.json";

export default function Quiz() {
  const questions = Array.isArray(quizQuestions) ? quizQuestions : [];
  const PAGE_SIZE = 4;

  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageIndex]);

  if (!questions.length) return <p className="p-6">No quiz questions available.</p>;

  const currentPageQuestions = questions.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE
  );

  const handleAnswer = (localIdx, option) => {
    const globalIndex = pageIndex * PAGE_SIZE + localIdx;
    const next = [...answers];
    next[globalIndex] = option;
    setAnswers(next);
  };

  const nextPage = async () => {
    if ((pageIndex + 1) * PAGE_SIZE >= questions.length) {
      await submitQuiz();
    } else {
      setPageIndex(pageIndex + 1);
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    setError(null);
    setAiResult(null);
    try {
      const filtered = answers.filter((a) => a !== null); // send selected only
      const res = await fetch("/api/quiz/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: filtered }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setAiResult(data);
    } catch (e) {
      setError(e.message || "Failed to analyze quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (aiResult) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Your Career Fit</h1>

        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-3">
          <h2 className="font-semibold">Top Matches</h2>
          {aiResult.topProfessions?.map((p, i) => (
            <div
              key={i}
              className="p-3 rounded bg-gradient-to-r from-pink-100 to-pink-200 shadow"
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{p.profession}</span>
                <span>{p.matchPercentage}%</span>
              </div>
              <div className="w-full bg-pink-200 h-2 rounded">
                <div
                  className="bg-pink-400 h-2 rounded"
                  style={{
                    width: `${Math.min(Math.max(p.matchPercentage, 0), 100)}%`,
                  }}
                />
              </div>
              {!!p.reasons?.length && (
                <ul className="list-disc ml-5 mt-2 text-sm">
                  {p.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Roadmaps</h2>
          {aiResult.topProfessions?.map((p, i) => {
            const rm = aiResult.roadmaps?.[p.profession] || {};
            const section = (label, items) => (
              <div className="p-3 rounded bg-gradient-to-r from-blue-100 to-blue-200 shadow">
                <h3 className="font-medium mb-2">{label}</h3>
                {Array.isArray(items) && items.length ? (
                  <ul className="list-disc ml-5 space-y-1">
                    {items.map((it, j) => (
                      <li key={j}>
                        <span className="font-medium">
                          {it.title || String(it)}
                        </span>
                        {it.why ? (
                          <span className="text-gray-600"> — {it.why}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No items provided.</p>
                )}
              </div>
            );
            return (
              <div
                key={i}
                className="p-4 rounded bg-gradient-to-r from-purple-100 to-purple-200 shadow"
              >
                <h3 className="font-semibold mb-2">{p.profession}</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {section("Beginner", rm.beginner)}
                  {section("Intermediate", rm.intermediate)}
                  {section("Advanced", rm.advanced)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Quiz</h1>

      {currentPageQuestions.map((q, idx) => (
        <div
          key={idx}
          className="p-4 rounded bg-gradient-to-r from-pink-100 to-pink-200 mb-4 shadow"
        >
          <p className="font-semibold mb-2">
            Question {pageIndex * PAGE_SIZE + idx + 1} of {questions.length}
          </p>
          <p className="mb-2">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(idx, opt)}
                className={`w-full py-2 px-4 rounded border transition 
                  ${
                    answers[pageIndex * PAGE_SIZE + idx] === opt
                      ? "bg-green-200 border-green-400"
                      : "bg-white hover:bg-green-100 border-gray-300"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={nextPage}
        disabled={submitting}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-200 to-pink-300 text-gray-800 font-medium hover:opacity-90"
      >
        {submitting
          ? "Analyzing..."
          : pageIndex * PAGE_SIZE + PAGE_SIZE >= questions.length
          ? "Finish Quiz"
          : "Next Page"}
      </button>

      {error && <p className="mt-3 text-red-600">{error}</p>}
    </div>
  );
}


// import React, { useState,useEffect } from "react";
// import quizQuestions from "../data/quiz.questions.json";

// export default function Quiz() {
//   const questions = Array.isArray(quizQuestions) ? quizQuestions : [];
//   const PAGE_SIZE = 4;

//   const [pageIndex, setPageIndex] = useState(0);
//   const [answers, setAnswers] = useState(Array(questions.length).fill(null));
//   const [submitting, setSubmitting] = useState(false);
//   const [aiResult, setAiResult] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [pageIndex]);

//   if (!questions.length) return <p className="p-6">No quiz questions available.</p>;

//   const currentPageQuestions = questions.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

//   const handleAnswer = (localIdx, option) => {
//     const globalIndex = pageIndex * PAGE_SIZE + localIdx;
//     const next = [...answers];
//     next[globalIndex] = option;
//     setAnswers(next);
//   };

//   const nextPage = async () => {
//     if ((pageIndex + 1) * PAGE_SIZE >= questions.length) {
//       await submitQuiz();
//     } else {
//       setPageIndex(pageIndex + 1);
//     }
//   };

//   const submitQuiz = async () => {
//     setSubmitting(true);
//     setError(null);
//     setAiResult(null);
//     try {
//       const filtered = answers.filter((a) => a !== null); // send selecteds only
//       const res = await fetch("http://localhost:5000/api/quiz/analyze", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ answers: filtered }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "Failed");
//       setAiResult(data);
//     } catch (e) {
//       setError(e.message || "Failed to analyze quiz");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (aiResult) {
//     return (
//       <div className="p-6 max-w-3xl mx-auto space-y-6">
//         <h1 className="text-2xl font-bold text-center">Your Career Fit</h1>

//         {error && <p className="text-red-600">{error}</p>}

//         <div className="space-y-3">
//           <h2 className="font-semibold">Top Matches</h2>
//           {aiResult.topProfessions?.map((p, i) => (
//             <div key={i} className="p-3 border rounded">
//               <div className="flex justify-between text-sm mb-1">
//                 <span className="font-medium">{p.profession}</span>
//                 <span>{p.matchPercentage}%</span>
//               </div>
//               <div className="w-full bg-gray-200 h-2 rounded">
//                 <div
//                   className="bg-blue-600 h-2 rounded"
//                   style={{ width: `${Math.min(Math.max(p.matchPercentage, 0), 100)}%` }}
//                 />
//               </div>
//               {!!p.reasons?.length && (
//                 <ul className="list-disc ml-5 mt-2 text-sm">
//                   {p.reasons.map((r, idx) => <li key={idx}>{r}</li>)}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="space-y-4">
//           <h2 className="font-semibold">Roadmaps</h2>
//           {aiResult.topProfessions?.map((p, i) => {
//             const rm = aiResult.roadmaps?.[p.profession] || {};
//             const section = (label, items) => (
//               <div className="p-3 bg-gray-50 rounded border">
//                 <h3 className="font-medium mb-2">{label}</h3>
//                 {Array.isArray(items) && items.length ? (
//                   <ul className="list-disc ml-5 space-y-1">
//                     {items.map((it, j) => (
//                       <li key={j}>
//                         <span className="font-medium">{it.title || String(it)}</span>
//                         {it.why ? <span className="text-gray-600"> — {it.why}</span> : null}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : <p className="text-sm text-gray-500">No items provided.</p>}
//               </div>
//             );
//             return (
//               <div key={i} className="p-4 border rounded">
//                 <h3 className="font-semibold mb-2">{p.profession}</h3>
//                 <div className="grid gap-3 md:grid-cols-3">
//                   {section("Beginner", rm.beginner)}
//                   {section("Intermediate", rm.intermediate)}
//                   {section("Advanced", rm.advanced)}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4 text-center">Quiz</h1>

//       {currentPageQuestions.map((q, idx) => (
//         <div key={idx} className="p-4 border rounded bg-gray-50 mb-4">
//           <p className="font-semibold mb-2">
//             Question {pageIndex * PAGE_SIZE + idx + 1} of {questions.length}
//           </p>
//           <p className="mb-2">{q.question}</p>
//           <div className="space-y-2">
//             {q.options.map((opt, i) => (
//               <button
//                 key={i}
//                 onClick={() => handleAnswer(idx, opt)}
//                 className={`w-full py-2 px-4 border rounded hover:bg-blue-100 ${
//                   answers[pageIndex * PAGE_SIZE + idx] === opt ? "bg-blue-200" : ""
//                 }`}
//               >
//                 {opt}
//               </button>
//             ))}
//           </div>
//         </div>
//       ))}

//       <button
//         onClick={nextPage}
//         disabled={submitting}
//         className="w-full py-2 bg-blue-600 text-white rounded-lg"
//       >
//         {submitting ? "Analyzing..." :
//           (pageIndex * PAGE_SIZE + PAGE_SIZE >= questions.length ? "Finish Quiz" : "Next Page")}
//       </button>

//       {error && <p className="mt-3 text-red-600">{error}</p>}
//     </div>
//   );
// }
