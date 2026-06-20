import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const text = "We are looking for a Software Engineer with 5 years of experience in React and Node.js at Google in NY.";
    const prompt = `You are an expert HR assistant. Analyze the following Job Description (JD) and extract the key information into a JSON object with the exact following keys:
- "jobTitle": The official job title.
- "company": The company name (if found, otherwise an empty string).
- "experience": Required years of experience (if found, otherwise an empty string).
- "skills": Key skills required, as a comma-separated string (if found, otherwise an empty string).
- "location": Job location or "Remote" (if found, otherwise an empty string).
- "description": A concise, 3-4 sentence summary of the role's responsibilities and top requirements.

Job Description Text:
${text}
`;
    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    console.log("Response Text:", response.text);
    console.log("Parsed:", JSON.parse(response.text));
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
