import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";

// Try to load .env using Node's built-in env loader (Node 20.6+)
try {
  process.loadEnvFile(".env");
} catch (err) {
  console.log("Could not load .env file, relying on existing environment variables.");
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const DIRS_TO_SCAN = ["app", "components"];
const EXTENSIONS = [".ts", ".tsx"];
const RUN_DURATION_HOURS = 8;
const RUN_DURATION_MS = RUN_DURATION_HOURS * 60 * 60 * 1000;
const DELAY_BETWEEN_CALLS_MS = 15000; // 15 seconds

async function getFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await getFiles(fullPath));
    } else {
      if (EXTENSIONS.includes(path.extname(fullPath))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function logChange(message) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${message}\n`;
  await fs.appendFile("agent-log.txt", logMsg);
  console.log(logMsg.trim());
}

async function runAgent() {
  await logChange("Starting recursive agent...");
  const startTime = Date.now();
  
  let allFiles = [];
  for (const dir of DIRS_TO_SCAN) {
    if (await fs.stat(dir).catch(() => null)) {
      const files = await getFiles(dir);
      allFiles = allFiles.concat(files);
    }
  }
  
  if (allFiles.length === 0) {
    await logChange("No files found to process.");
    return;
  }
  
  await logChange(`Found ${allFiles.length} files to potentially improve.`);

  while (Date.now() - startTime < RUN_DURATION_MS) {
    // Pick a random file
    const targetFile = allFiles[Math.floor(Math.random() * allFiles.length)];
    await logChange(`Selected ${targetFile} for improvement.`);
    
    try {
      const content = await fs.readFile(targetFile, "utf-8");
      
      const prompt = `You are an expert AI code improver. Analyze the following TypeScript/React code and improve it.
Focus on:
1. Best practices and modern syntax
2. Improved naming and readability
3. Type safety
4. Performance optimizations
5. Removing unused code
Do NOT change the core functionality or business logic.

Respond ONLY with valid JSON in the following format, with no markdown code blocks wrapping the JSON:
{
  "improvedCode": "the fully updated file content",
  "explanation": "A short summary of what you changed"
}

Code to improve:
\`\`\`typescript
${content}
\`\`\`
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const responseText = response.text || "";
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
      } catch (e) {
        // sometimes it might wrap in ```json ... ```
        const cleaned = responseText.replace(/^```json/m, "").replace(/```$/m, "").trim();
        jsonResponse = JSON.parse(cleaned);
      }
      
      if (jsonResponse && jsonResponse.improvedCode && jsonResponse.explanation) {
        // To be safe, don't overwrite if it's empty
        if (jsonResponse.improvedCode.trim().length > 50) {
           await fs.writeFile(targetFile, jsonResponse.improvedCode);
           await logChange(`Successfully improved ${targetFile}. Explanation: ${jsonResponse.explanation}`);
        } else {
           await logChange(`Skipped ${targetFile} due to suspiciously short improved code.`);
        }
      } else {
        await logChange(`Failed to parse response for ${targetFile}.`);
      }
      
    } catch (error) {
      await logChange(`Error processing ${targetFile}: ${error.message}`);
    }
    
    await logChange(`Sleeping for ${DELAY_BETWEEN_CALLS_MS / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CALLS_MS));
  }
  
  await logChange("Agent run completed after 8 hours.");
}

runAgent().catch(console.error);
