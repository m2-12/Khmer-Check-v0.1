import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBf7U9RRrndzu5DMQaocUUr_1nyzNy5mEc";

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const handler = async (event: any) => {
  // Support simple health check or GET
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ok", message: "Khmer OCR Netlify Serverless Function ready" })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { imageBase64, mimeType = "image/png", customRules = [] } = body;

    if (!imageBase64) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No image base64 payload provided." })
      };
    }

    if (!apiKey || apiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getDemoAnalysis(mimeType, customRules))
      };
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const rulesPromptSegment = customRules.length > 0 
      ? `Additionally, strictly respect these custom corporate/brand dictionary rules during correction and vocabulary replacement:\n${customRules.map((r: any) => `- Replace "${r.term}" with "${r.replacement}" (Category: ${r.category})`).join("\n")}`
      : "";

    const systemInstruction = `You are a professional Khmer language expert, typographer, and digital poster editor.
Your task is to analyze the uploaded image (poster, flyer, ad banner, or social media post), identify ALL visible text (specifically focusing on Khmer language, and any mixed English words), estimate their approximate positions for layering highlights, and perform deep language and design analysis.

For each Khmer word, phrase, or sentence, perform rigorous analyses on:
1. Spelling mistakes: correct written forms and check subscript sequences.
2. Space errors: Khmer is usually written without word spaces, except after punctuation, clauses, or for breathing room. Alert if spacings break semantic words or appear crowded.
3. Typography consistency: warn if modern stylized curved fonts make it unreadable, or diacritics sit awkwardly, or Unicode ordering is broken (leading to red blocks or broken diacritics).
4. Tone & Marketing copywriting impact: give better creative copy options styled for posters (headlines, hooky calls to action).

Provide boundingbox percentage values (0 - 100 relative to poster container width & height) where:
- x represents the starting horizontal position from left edge.
- y represents the starting vertical position from top edge.
- width represents the horizontal coverage.
- height represents the vertical coverage.
Do your best to align these coordinates visually with the words present in the image.

${rulesPromptSegment}

Return the entire analysis STRICTLY formatted according to the provided JSON Schema. Do not wrap in markdown text blocks outside the JSON itself. Make explanations helpful and descriptive. Use elegant Khmer or English for explanation fields. Ensure all text outputs use standard, normalized Khmer Unicode.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        imagePart,
        { text: "Perform the comprehensive Khmer OCR and deep grammar check on this graphic. Analyze text placements, spellings, tones, and provide better copywriting options." }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStats: {
              type: Type.OBJECT,
              properties: {
                confidenceScore: { type: Type.INTEGER, description: "OCR text capture confidence 0-100" },
                grammarSpacerScore: { type: Type.INTEGER, description: "Khmer Grammar & spacing compliance rating 0-100" },
                marketingImpactScore: { type: Type.INTEGER, description: "How strong the headlines / poster copy score is 0-100" }
              },
              required: ["confidenceScore", "grammarSpacerScore", "marketingImpactScore"]
            },
            layoutAdvice: {
              type: Type.OBJECT,
              properties: {
                hasOverlapIssue: { type: Type.BOOLEAN, description: "True if text overlaps important visual graphics or faces" },
                overlapDetails: { type: Type.STRING, description: "Description or coordinate indicators of overlaps, null if perfect" },
                spacingDistributionRating: { type: Type.STRING, description: "Aesthetic placement description like 'Well balanced', 'Crowded top'" },
                aestheticVibeMatch: { type: Type.STRING, description: "Detected vibe of the poster, e.g., 'Modern Cafe Promotion', 'Corporate sale'" }
              },
              required: ["hasOverlapIssue", "overlapDetails", "spacingDistributionRating", "aestheticVibeMatch"]
            },
            marketingHooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly engaging, catchy Khmer ad headlines/hook suggestions suited for this poster's niche"
            },
            items: {
              type: Type.ARRAY,
              description: "Array of extracted text regions, mistakes, and positioning",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Generated short index or uuid string" },
                  originalText: { type: Type.STRING, description: "The exact extracted text from the image" },
                  correctedText: { type: Type.STRING, description: "The corrected Khmer content. If the text is flawless, return the original text itself or null." },
                  boundingBox: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER, description: "X percentage coordinate from left (0 to 100)" },
                      y: { type: Type.NUMBER, description: "Y percentage coordinate from top (0 to 100)" },
                      width: { type: Type.NUMBER, description: "Width percentage coverage on the image (0 to 100)" },
                      height: { type: Type.NUMBER, description: "Height percentage coverage on the image (0 to 100)" }
                    },
                    required: ["x", "y", "width", "height"]
                  },
                  category: { 
                    type: Type.STRING, 
                    description: "Error type category: spelling, spacing, grammar, typography, tone, or ok" 
                  },
                  explanation: { type: Type.STRING, description: "Concise reason why it is wrong or how spacing/spelling can represent better native rules" },
                  alternatives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Creative copy alternatives or synonyms"
                  },
                  readabilityRating: { type: Type.STRING, description: "Excellent, Fair, or Poor readability score" },
                  fontReadabilityWarning: { type: Type.STRING, description: "Empty/null or warnings if the font weight or style in this bounding box makes Khmer letters difficult to decipher" }
                },
                required: ["id", "originalText", "boundingBox", "category", "explanation", "alternatives", "readabilityRating"]
              }
            }
          },
          required: ["overallStats", "layoutAdvice", "marketingHooks", "items"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI engine.");
    }

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: resultText
    };

  } catch (error: any) {
    console.error("OCR Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to process image.",
        details: error.message || error
      })
    };
  }
};

function getDemoAnalysis(mimeType: string, customRules: any[]): any {
  return {
    overallStats: {
      confidenceScore: 92,
      grammarSpacerScore: 78,
      marketingImpactScore: 85
    },
    layoutAdvice: {
      hasOverlapIssue: true,
      overlapDetails: "Text in the lower region 'ទិញ1ថែម1 ឆាប់ឡើង!!' overlaps with coffee cup graphics.",
      spacingDistributionRating: "Slightly crowded bottom layout",
      aestheticVibeMatch: "Traditional street promotion style cafe banner"
    },
    marketingHooks: [
      "រសជាតិពិត កាហ្វេខ្មែរ ឈ្ងុយឆ្ងាញ់រាល់ព្រឹកព្រលឹម!",
      "ឱកាសមាស! ទិញ ១ ថែម ១ សម្រាប់ថាមពលពេញមួយថ្ងៃ",
      "ប្រញាប់ឡើង! កាហ្វេក្តៅឧណ្ហៗ ទិញ ១ ថែម ១ មានកំណត់"
    ],
    items: [
      {
         id: "item_1",
         originalText: "ទិញ1ថែម1 ឆាប់ឡើង!!",
         correctedText: "ទិញ ១ ថែម ១ រួសរាន់ឡើង!",
         boundingBox: { x: 15, y: 72, width: 70, height: 12 },
         category: "spacing",
         explanation: "ប្រើលេខខ្មែរ (១) និងចន្លោះសមរម្យដើម្បីសោភ័ណភាព និងបន្ថែម 'រួសរាន់ឡើង' បង្កើនជំនឿចិត្ត។",
         alternatives: [
           "ទិញ ១ ថែម ១ មានកំណត់!",
           "ឱកាសពិសេស ទិញ ១ ថែម ១!"
         ],
         readabilityRating: "excellent",
         fontReadabilityWarning: null
      }
    ]
  };
}
