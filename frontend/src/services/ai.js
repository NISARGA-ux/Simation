import Groq from "groq-sdk";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Create a lazy getter for Groq so that missing API keys won't crash the entire app on load
function getGroqClient() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("VITE_GROQ_API_KEY is missing. Please add it to your .env file.");
  
  return new Groq({
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });
}

/**
 * Extract text from a File object (PDF or DOCX).
 */
export async function extractTextFromFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  
  if (extension === "pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      text += strings.join(" ") + "\n";
    }
    return text;
  } else if (extension === "docx" || extension === "doc") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (extension === "txt") {
    return await file.text();
  }

  throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
}

/**
 * Analyze resume text using Groq to extract skills, gaps, domains, and ATS score.
 */
export async function analyzeResume(resumeText, targetRole) {
  const prompt = `
You are an expert tech recruiter and ATS system. Analyze the following resume.
Target Role: ${targetRole || "Software Engineer / Tech Professional"}

Resume Text:
${resumeText.substring(0, 5000)} // Truncate to avoid token limits

Provide a strictly formatted JSON response containing:
{
  "atsScore": (number between 0-10),
  "extractedSkills": ["skill1", "skill2"],
  "experienceLevel": "Entry/Mid/Senior",
  "domain": "Frontend/Backend/Data Science/etc",
  "pros": ["strong point 1", "strong point 2"],
  "cons": ["weakness 1", "weakness 2"],
  "skillGaps": [
    {
      "missingSkill": "skill name",
      "importance": "Why it is demanded in the industry",
      "learningPath": "Suggested steps to learn"
    }
  ],
  "keywordSuggestions": ["keyword1", "keyword2"]
}
Return ONLY valid JSON. Do not include markdown formatting or extra text.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Groq Analysis Error:", error);
    throw new Error("Failed to analyze resume with AI.");
  }
}

/**
 * Fetch course recommendations using Tavily API based on identified skill gaps.
 */
export async function fetchCourses(skillGaps) {
  const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;
  if (!tavilyApiKey) return [];

  const courses = [];
  
  // We take the top 3 skill gaps to avoid excessive API calls
  const topGaps = skillGaps.slice(0, 3);

  for (const gap of topGaps) {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: `best high-quality online course for ${gap.missingSkill} coursera edx udemy`,
          search_depth: "basic",
          include_answer: true,
          max_results: 2,
        }),
      });

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        courses.push({
          skill: gap.missingSkill,
          relevance: gap.importance,
          links: data.results.map(r => ({
            title: r.title,
            url: r.url,
            snippet: r.content
          }))
        });
      }
    } catch (error) {
      console.error("Tavily Search Error:", error);
    }
  }

  return courses;
}

/**
 * Generate a dynamic quiz based on skill gaps.
 */
export async function generateQuizQuestions(skillGaps, domain) {
  if (!skillGaps || skillGaps.length === 0) {
    // fallback if no skill gaps
    skillGaps = [{ missingSkill: "General Software Engineering Concepts" }];
  }

  const skillsStr = skillGaps.map((g) => g.missingSkill).join(", ");
  
  const prompt = `
Generate a 5-question multiple choice technical quiz assessing the following skills: ${skillsStr}.
Target Domain: ${domain || "General Tech"}

Provide a strictly formatted JSON response containing:
{
  "questions": [
    {
      "question": "The actual question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "The exact string of the correct option",
      "explanation": "Why this answer is correct",
      "difficulty": "Easy/Medium/Hard"
    }
  ]
}
Return ONLY valid JSON. Do not include markdown formatting or extra text.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    return parsed.questions || [];
  } catch (error) {
    console.error("Groq Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz.");
  }
}
