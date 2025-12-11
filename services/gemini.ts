import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, IssueSeverity, SimulationResult } from "../types";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeRosCode = async (code: string): Promise<AnalysisReport> => {
  try {
    const ai = getAI();
    const prompt = `
      You are an expert ROS (Robot Operating System) Developer and Code Reviewer.
      Analyze the following ROS/ROS2 code (Python or C++).
      
      Perform the following checks:
      1. Syntax Correctness (Simulate a linter like flake8 or dry-run g++).
      2. ROS Structure (proper initialization, node creation, publisher/subscriber setup).
      3. Safety Heuristics (loops with sleep/rate, joint value ranges if visible, exception handling).
      
      Code to Analyze:
      ${code.substring(0, 10000)}

      Return the result strictly as a JSON object matching this schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER, description: "A quality score from 0 to 100" },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ["error", "warning", "info"] },
                  line: { type: Type.NUMBER },
                  message: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            },
            detectedNodes: { type: Type.ARRAY, items: { type: Type.STRING } },
            detectedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            safetyCheck: {
              type: Type.OBJECT,
              properties: {
                safe: { type: Type.BOOLEAN },
                details: { type: Type.STRING }
              }
            }
          },
          required: ["isValid", "score", "issues", "detectedNodes", "detectedTopics", "safetyCheck"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisReport;

  } catch (error) {
    console.error("Analysis Failed", error);
    // Fallback error report
    return {
      isValid: false,
      score: 0,
      issues: [{ severity: IssueSeverity.ERROR, message: "Failed to analyze code via Gemini API. Check API Key." }],
      detectedNodes: [],
      detectedTopics: [],
      safetyCheck: { safe: false, details: "Analysis failed." }
    };
  }
};

export const generateSimulationPreview = async (nodeNames: string[]): Promise<SimulationResult> => {
  try {
    const ai = getAI();
    
    // 1. Generate Logs
    const logPrompt = `
      Generate a realistic simulation log for a ROS robot arm (e.g., UR5) running the nodes: ${nodeNames.join(', ')}.
      The task is a pick-and-place operation of a cube.
      Include exactly 8 log lines with timestamps, log levels (INFO, WARN), and typical ROS messages.
      End with a success message.
      Return JSON.
    `;

    const logResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: logPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            logs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ["INFO", "WARN", "ERROR"] },
                  node: { type: Type.STRING },
                  message: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    const logData = JSON.parse(logResponse.text || "{}");

    // 2. Generate a visual frame (Simulated Screenshot)
    // We will generate one key frame representing the action
    const imagePrompt = "A photorealistic simulation screenshot of a UR5 robotic arm in Gazebo simulator picking up a red cube from a table. Grey grid background, engineering visualization style.";
    
    let imageBase64 = "";
    try {
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: imagePrompt,
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    } catch (e) {
      console.warn("Image generation failed, using placeholder", e);
    }

    return {
      success: logData.success ?? true,
      logs: logData.logs || [],
      frames: imageBase64 ? [`data:image/png;base64,${imageBase64}`] : []
    };

  } catch (error) {
    console.error("Simulation generation failed", error);
    return {
      success: false,
      logs: [{ timestamp: "0.000", level: "ERROR", node: "system", message: "Simulation service unreachable." }],
      frames: []
    };
  }
};
