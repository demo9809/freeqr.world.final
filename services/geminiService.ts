import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QRModuleStyle, QREyeStyle } from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const BRANDING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    fgColor: { type: Type.STRING, description: "A hex color code for the QR code foreground (should be dark/high contrast)." },
    bgColor: { type: Type.STRING, description: "A hex color code for the background (should be light)." },
    moduleStyle: { type: Type.STRING, enum: [QRModuleStyle.SQUARE, QRModuleStyle.DOTS, QRModuleStyle.ROUNDED, QRModuleStyle.DIAMOND] },
    explanation: { type: Type.STRING, description: "Short reason for these choices." }
  },
  required: ["fgColor", "bgColor", "moduleStyle", "explanation"]
};

export const generateBranding = async (description: string) => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a QR code visual style (colors and shape) based on this brand/context description: "${description}". Ensure high contrast for scannability.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: BRANDING_SCHEMA,
        temperature: 0.7
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Branding Error:", error);
    throw error;
  }
};

export const polishContent = async (text: string, context: string) => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following text to be more ${context} (e.g., professional, catchy, concise). Text: "${text}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Content Error:", error);
    throw error;
  }
};
