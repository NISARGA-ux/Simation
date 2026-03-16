// frontend/src/pages/Resume.jsx
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".pdf,.doc,.docx",
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return alert("Please upload a resume!");
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);

    try {
      const res = await fetch("/api/resume/analyse-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("❌ Error:", err);
      setResult({ error: "Error analysing resume. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Resume Analyzer</h1>

      <input
        type="text"
        placeholder="Target Job Role (optional)"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 rounded-lg text-center mb-4 cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-pink-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drag & drop your resume here, or click to select</p>}
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full py-2 bg-pink-600 text-white rounded-lg mb-6"
      >
        {loading ? "Analysing..." : "Analyse Resume"}
      </button>

      {result && !result.error && (
        <div className="space-y-4">

          {/* ATS Score with progress bar */}
          <div className="p-4 border rounded bg-green-50">
            <h2 className="font-bold mb-1">ATS Score</h2>
            <p className="text-2xl">{result.atsScore?.toFixed(1)} / 10</p>
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${(result.atsScore / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-1">Pros</h3>
            <ul className="list-disc pl-5">
              {result.pros?.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-1">Cons</h3>
            <ul className="list-disc pl-5">
              {result.cons?.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-1">Improvements</h3>
            <ul className="list-disc pl-5">
              {result.improvements?.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-1">Keyword Suggestions</h3>
            <ul className="list-disc pl-5">
              {result.keywordSuggestions?.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>

        </div>
      )}

      {result?.error && <p className="text-red-500 font-bold">{result.error}</p>}
    </div>
  );
}


// // frontend/src/pages/Resume.jsx
// import React, { useState } from "react";
// import { useDropzone } from "react-dropzone";

// export default function Resume() {
//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [targetRole, setTargetRole] = useState("");

//   const onDrop = (acceptedFiles) => {
//     setFile(acceptedFiles[0]);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: ".pdf,.doc,.docx",
//     multiple: false,
//   });

//   const handleUpload = async () => {
//     if (!file) return alert("Please upload a resume!");
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("resume", file);
//     formData.append("targetRole", targetRole);

//     try {
//       const res = await fetch("http://localhost:5000/api/resume/analyse-file", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       setResult(data); // ✅ directly store JSON object now
//     } catch (err) {
//       console.error("❌ Error:", err);
//       setResult({ error: "Error analysing resume. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4 text-center">Resume Analyzer</h1>

//       <input
//         type="text"
//         placeholder="Target Job Role (optional)"
//         value={targetRole}
//         onChange={(e) => setTargetRole(e.target.value)}
//         className="border p-2 rounded w-full mb-4"
//       />

//       <div
//         {...getRootProps()}
//         className={`border-2 border-dashed p-10 rounded-lg text-center mb-4 cursor-pointer transition-colors ${
//           isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
//         }`}
//       >
//         <input {...getInputProps()} />
//         {file ? <p>{file.name}</p> : <p>Drag & drop your resume here, or click to select</p>}
//       </div>

//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="w-full py-2 bg-blue-600 text-white rounded-lg mb-6"
//       >
//         {loading ? "Analysing..." : "Analyse Resume"}
//       </button>

//       {result && !result.error && (
//   <div className="space-y-4">
//     <div className="p-4 border rounded bg-green-50">
//       <h2 className="font-bold mb-1">ATS Score</h2>
//       <p className="text-2xl">{result.atsScore}</p>
//     </div>

//     <div className="p-4 border rounded">
//       <h3 className="font-bold mb-1">Pros</h3>
//       <ul className="list-disc pl-5">
//         {result.pros?.map((p, i) => <li key={i}>{p}</li>)}
//       </ul>
//     </div>

//     <div className="p-4 border rounded">
//       <h3 className="font-bold mb-1">Cons</h3>
//       <ul className="list-disc pl-5">
//         {result.cons?.map((c, i) => <li key={i}>{c}</li>)}
//       </ul>
//     </div>

//     <div className="p-4 border rounded">
//       <h3 className="font-bold mb-1">Improvements</h3>
//       <ul className="list-disc pl-5">
//         {result.improvements?.map((x, i) => <li key={i}>{x}</li>)}
//       </ul>
//     </div>

//     <div className="p-4 border rounded">
//       <h3 className="font-bold mb-1">Keyword Suggestions</h3>
//       <ul className="list-disc pl-5">
//         {result.keywordSuggestions?.map((k, i) => <li key={i}>{k}</li>)}
//       </ul>
//     </div>
//   </div>
// )}


//       {result?.error && <p className="text-red-500 font-bold">{result.error}</p>}
//     </div>
//   );
// }
