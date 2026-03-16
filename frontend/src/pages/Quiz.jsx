import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiCpu, FiAward, FiSettings } from "react-icons/fi";
import { generateQuizQuestions } from "../services/ai";

export default function Quiz() {
  // states: "setup", "generating", "playing", "results"
  const [appState, setAppState] = useState("setup");
  const [topic, setTopic] = useState("");
  const [domain, setDomain] = useState("");
  const [questions, setQuestions] = useState([]);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIdx, appState]);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic or skill!");
    setAppState("generating");
    setError(null);
    try {
      const q = await generateQuizQuestions([{ missingSkill: topic }], domain);
      if (!q || q.length === 0) throw new Error("Could not generate questions.");
      setQuestions(q);
      setAnswers({});
      setCurrentIdx(0);
      setAppState("playing");
    } catch (err) {
      console.error(err);
      setError("Failed to generate quiz. Please check API keys.");
      setAppState("setup");
    }
  };

  const handleSelectAnswer = (opt) => {
    setAnswers({ ...answers, [currentIdx]: opt });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setAppState("results");
    }
  };

  if (appState === "setup" || appState === "generating") {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <FiCpu className="text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Skill Assessment</h1>
          <p className="text-gray-500">Generate a personalized technical quiz to test your understanding of any skill.</p>
          
          <div className="space-y-4 text-left mt-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Skill / Topic</label>
              <input
                type="text"
                placeholder="e.g. React hooks, Docker fundamentals..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                disabled={appState === "generating"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Domain (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Frontend, DevOps, Data Science..."
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                disabled={appState === "generating"}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={appState === "generating" || !topic.trim()}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {appState === "generating" ? "Generating Questions..." : "Create Custom Quiz"}
            </button>
            {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (appState === "playing") {
    const q = questions[currentIdx];
    const isAnswered = answers[currentIdx] !== undefined;

    return (
      <div className="p-6 max-w-2xl mx-auto mt-6 animate-slide-up">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span className="text-pink-600">{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-pink-500 h-2 transition-all duration-300 ease-out"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800 leading-relaxed">{q.question}</h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-4 
              ${q.difficulty?.toLowerCase() === 'hard' ? 'bg-red-50 text-red-600 border border-red-100' : 
                q.difficulty?.toLowerCase() === 'medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 
                'bg-green-50 text-green-600 border border-green-100'}`}>
              {q.difficulty || "Medium"}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectAnswer(opt)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 
                  ${answers[currentIdx] === opt 
                    ? "border-pink-500 bg-pink-50 text-pink-900 shadow-sm ring-1 ring-pink-500" 
                    : "border-gray-200 hover:border-pink-300 hover:bg-gray-50 text-gray-700"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium
                    ${answers[currentIdx] === opt ? "border-pink-500 bg-pink-500 text-white" : "border-gray-300 text-gray-500"}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  {opt}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="w-full mt-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {currentIdx === questions.length - 1 ? "Submit Quiz" : "Next Question"}
          </button>
        </div>
      </div>
    );
  }

  if (appState === "results") {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    return (
      <div className="p-6 max-w-3xl mx-auto mt-6 animate-fade-in space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-100 to-purple-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
            <FiAward className="text-4xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500">You scored <span className="font-bold text-pink-600 text-xl">{score}</span> out of {questions.length}</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 px-2">Detailed Analysis</h3>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            return (
              <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border ${isCorrect ? "border-green-100" : "border-red-100"}`}>
                <div className="flex gap-4">
                  <div className="mt-1">
                    {isCorrect ? <FiCheckCircle className="text-green-500 text-xl" /> : <FiXCircle className="text-red-500 text-xl" />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="font-semibold text-gray-800">{q.question}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <span className="text-gray-500 block mb-1">Your Answer</span>
                        <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {answers[i] || "Skipped"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg border border-green-100 bg-green-50">
                        <span className="text-green-800 block mb-1 opacity-70">Correct Answer</span>
                        <span className="font-medium text-green-800">{q.correctAnswer}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
                      <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Why?</span> {q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setAppState("setup")}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  return null;
}
