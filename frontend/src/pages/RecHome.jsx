import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RecHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: "JD Intelligence Engine",
      description: "Paste any job description → AI extracts skills → instantly see ranked student matches with radar charts and match percentages.",
      icon: "🔍",
      color: "from-violet-50 to-violet-100 border-violet-200",
      iconBg: "bg-violet-100",
      action: () => navigate("/recjd"),
      buttonText: "Analyze a JD",
      primary: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm text-gray-500 font-medium">Welcome back,</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {user?.name || "Recruiter"}
          </h1>
          {user?.company && (
            <p className="text-gray-500 mt-1">{user.company}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${f.color} border rounded-xl p-6 flex flex-col justify-between transition hover:shadow-md`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center text-2xl mb-4`}>
                  {f.icon}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{f.title}</h2>
                <p className="text-sm text-gray-600 mt-2">{f.description}</p>
              </div>
              <button
                onClick={f.action}
                className={`mt-5 w-full py-2.5 rounded-lg font-semibold text-sm transition ${
                  f.primary
                    ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Quick tip */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Pro Tip for Demo</h3>
          <p className="text-sm text-gray-600">
            Start with the <span className="font-semibold text-violet-600">JD Intelligence Engine</span>.
            Paste a real job description from Google, Amazon, or Flipkart — the AI extracts
            every skill, maps them against student portfolios, and shows ranked candidates
            with radar charts in under 5 seconds. Try the sample JDs if you don&apos;t have one handy.
          </p>
        </div>
      </div>
    </div>
  );
}
