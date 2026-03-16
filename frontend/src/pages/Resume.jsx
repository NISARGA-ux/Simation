import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiBriefcase, FiCheckCircle, FiAlertCircle, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { extractTextFromFile, analyzeResume, fetchCourses } from "../services/ai";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [courses, setCourses] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"]
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return alert("Please upload a resume!");
    setLoading(true);
    setResult(null);
    setCourses([]);

    try {
      setLoadingStep("Extracting text from resume...");
      const text = await extractTextFromFile(file);

      setLoadingStep("Analyzing resume & identifying skill gaps...");
      const analysis = await analyzeResume(text, targetRole);
      setResult(analysis);

      if (analysis.skillGaps && analysis.skillGaps.length > 0) {
        setLoadingStep("Finding smart course recommendations...");
        const relevantCourses = await fetchCourses(analysis.skillGaps);
        setCourses(relevantCourses);
      }

      setLoadingStep("");
    } catch (err) {
      console.error("❌ Error:", err);
      setResult({ error: "Error analysing resume. Please verify your API keys and try again." });
      setLoadingStep("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Resume Analyzer</h1>
        <p className="text-gray-500">Uncover skill gaps and get personalized course recommendations to land your dream role.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Target Job Role (e.g. Frontend Engineer)"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-xl w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-12 rounded-xl text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? "border-pink-500 bg-pink-50 shadow-inner" : "border-gray-300 hover:border-pink-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-3" />
          {file ? (
            <p className="font-medium text-pink-600">{file.name}</p>
          ) : (
            <div className="text-gray-500">
              <span className="font-semibold text-pink-600">Click to upload</span> or drag and drop
              <p className="text-sm mt-1">PDF, DOCX, or TXT up to 10MB</p>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {loadingStep}
            </span>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </div>

      {result && !result.error && (
        <div className="space-y-8 animate-slide-up">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
              <h2 className="text-gray-500 font-medium mb-2">ATS Score</h2>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke={result.atsScore >= 8 ? "#10b981" : result.atsScore >= 5 ? "#eab308" : "#ef4444"} 
                    strokeWidth="8" fill="none" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * (result.atsScore || 0)) / 10} 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-800">{result.atsScore?.toFixed(1)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col justify-center">
              <h2 className="text-gray-500 font-medium mb-4">Profile Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Experience Level</p>
                  <p className="font-semibold text-lg text-gray-800">{result.experienceLevel || "Not Detected"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Primary Domain</p>
                  <p className="font-semibold text-lg text-gray-800">{result.domain || "Not Detected"}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Top Skills Detected</p>
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills?.slice(0, 6).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
              <h3 className="flex items-center gap-2 font-bold text-green-800 mb-4">
                <FiCheckCircle /> Strategic Strengths
              </h3>
              <ul className="space-y-3">
                {result.pros?.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
              <h3 className="flex items-center gap-2 font-bold text-red-800 mb-4">
                <FiAlertCircle /> Areas of Concern
              </h3>
              <ul className="space-y-3">
                {result.cons?.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skill Gaps Analysis */}
          {result.skillGaps && result.skillGaps.length > 0 && (
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="text-2xl font-bold mb-6 text-gray-800">Critical Skill Gaps</h3>
               <div className="space-y-6">
                 {result.skillGaps.map((gap, i) => (
                   <div key={i} className="p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                     <h4 className="font-bold text-lg text-gray-900 mb-2">{gap.missingSkill}</h4>
                     <p className="text-gray-600 mb-3"><span className="font-medium text-gray-800">Why it matters:</span> {gap.importance}</p>
                     <p className="text-gray-600"><span className="font-medium text-gray-800">How to learn:</span> {gap.learningPath}</p>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* Smart Course Recommendations */}
          {courses.length > 0 && (
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-100">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-indigo-600 text-white rounded-lg">
                   <FiBookOpen className="text-xl" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-indigo-900">Smart Recommendations</h3>
                   <p className="text-indigo-600/80">Tailored courses to bridge your skill gaps.</p>
                 </div>
               </div>

               <div className="space-y-6">
                 {courses.map((courseGap, i) => (
                   <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50">
                     <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                       Bridge gap: <span className="text-pink-600 bg-pink-50 px-3 py-1 rounded-full text-sm">{courseGap.skill}</span>
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {courseGap.links?.map((link, j) => (
                         <a 
                           key={j} 
                           href={link.url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="block p-4 border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all rounded-xl group"
                         >
                           <h5 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600">{link.title}</h5>
                           <p className="text-sm text-gray-500 mb-3 line-clamp-2">{link.snippet}</p>
                           <span className="text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                             View Course <FiArrowRight />
                           </span>
                         </a>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

        </div>
      )}

      {result?.error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-slide-up">
          <FiAlertCircle className="text-xl" />
          <p className="font-medium">{result.error}</p>
        </div>
      )}
    </div>
  );
}
