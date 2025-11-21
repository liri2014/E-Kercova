
import { GoogleGenAI, Type } from "@google/genai";
import { ReportCategory } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove 'data:mime/type;base64,' prefix
      resolve(result.split(',')[1]);
    }
    reader.onerror = (error) => reject(error);
  });
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeReportDetails = async (
  photoFile: File,
  description: string
): Promise<{ title: string; category: ReportCategory }> => {
  try {
    const base64Image = await fileToBase64(photoFile);
    const imagePart = {
      inlineData: {
        mimeType: photoFile.type,
        data: base64Image,
      },
    };

    const categories = Object.values(ReportCategory).join(', ');
    const prompt = `You are an intelligent assistant for a municipal problem reporting app. Analyze the provided image and the user's brief description. Your goal is to generate a concise, descriptive title for the report and select the most appropriate category from the available list.
    User's description: "${description}"
    Available categories: ${categories}
    Return the result as a JSON object with 'title' and 'category' keys. The category must be one of the provided options.`;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A concise, descriptive title for the report.",
            },
            category: {
              type: Type.STRING,
              description: `The most relevant category from the list: ${categories}`,
              enum: Object.values(ReportCategory),
            },
          },
          required: ["title", "category"],
        },
      },
    });
    
    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    // Validate if the returned category is a valid enum member
    if (Object.values(ReportCategory).includes(result.category)) {
        return { title: result.title, category: result.category as ReportCategory };
    } else {
        // Fallback if the model returns an invalid category
        return { title: result.title, category: ReportCategory.OTHER };
    }

  } catch (error) {
    console.error("Error analyzing report with Gemini:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};
