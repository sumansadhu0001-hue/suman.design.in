import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import { corsHeaders, buildResponse } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return buildResponse(405, { error: "Method Not Allowed" });
  }

  try {
    const { contents } = JSON.parse(event.body || "{}");
    if (!contents || !Array.isArray(contents)) {
      return buildResponse(400, { error: "Invalid request. 'contents' must be an array of chat turns." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return buildResponse(500, { error: "GEMINI_API_KEY is not configured on the server." });
    }

    const systemInstruction = `You are 'Suman.design AI', an elite, highly professional AI digital consultant representing Suman Design, a premium web development and custom digital architecture agency. Suman Design builds custom, high-performance, visual-first bespoke websites, tailored e-commerce systems, high-converting corporate portals, and custom web applications with beautiful layouts, micro-animations, and elite technical execution.

Speak with elegant, objective, polished professionalism. Be helpful, clear, and concise. Keep replies beautifully formatted with clean headers, bullet points, and bold text for key metrics or technical aspects.

You have the unique ability to interact directly with the client's interface using special hidden commands. Whenever a user asks to see a page, section, portfolio, pricing, or wants to get in touch, or when you feel it is highly relevant, append the appropriate command tag to the VERY END of your response (after all your text):
- If they want to view projects or portfolio: append [NAVIGATE: work]
- If they want to see services offered: append [NAVIGATE: services]
- If they want to view pricing plans: append [NAVIGATE: pricing]
- If they want to contact us or start a project: append [NAVIGATE: contact]
- If they want to return home: append [NAVIGATE: home]
- If they ask to toggle, change, switch theme (dark/light mode) or complain about brightness: append [TOGGLE_THEME]

Example of adding a command:
"Certainly! Here is a showcase of our recent works. I have navigated your screen to our selected portfolio section so you can inspect them... [NAVIGATE: work]"

Never explain the bracketed command syntax to the user; just output it naturally at the very end.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: { systemInstruction }
      });
    } catch (primaryError: any) {
      console.log("Chat: switching engine profile");
      
      // Wait slightly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: contents,
          config: { systemInstruction }
        });
      } catch (fallbackError: any) {
        throw fallbackError;
      }
    }

    return buildResponse(200, { text: response.text });
  } catch (error: any) {
    console.log("Chat processing warning handled.");
    return buildResponse(500, { error: "Service temporarily unavailable. Please try again later." });
  }
};
