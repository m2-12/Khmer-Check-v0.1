import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // Read API Key dynamically from environment inside handler to support runtime injection
  const activeApiKey = process.env.GEMINI_API_KEY || "";

  // Common CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };

  // Support OPTIONS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" })
    };
  }

  // Support simple health check or GET
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify({ 
        status: "ok", 
        message: "Khmer OCR Netlify Serverless Function ready",
        hasApiKey: !!activeApiKey && activeApiKey !== "MOCK_KEY_IF_NOT_CONFIGURED"
      })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { imageBase64, mimeType = "image/png", customRules = [] } = body;

    if (
      !imageBase64 ||
      imageBase64 === "https://example.com/placeholder-trigger-for-mock" ||
      imageBase64.startsWith("http://") ||
      imageBase64.startsWith("https://")
    ) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        body: JSON.stringify({ ...getDemoAnalysis(mimeType, customRules), isMock: true })
      };
    }

    if (!activeApiKey || activeApiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        body: JSON.stringify({ ...getDemoAnalysis(mimeType, customRules), isMock: true })
      };
    }

    // Dynamic initialization of active AI service using live API key
    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

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

    const systemInstruction = `You are a professional Khmer language expert, senior typographer, and elite digital poster copywriter/proofreader.
Your task is to analyze the uploaded poster/banner/flyer image, capture ALL visible text (in Khmer and any auxiliary English or numeric layers), map their coordinates, and run a rigorous grammar, spelling, spacing, and typographic audit.

CRITICAL LINGUISTIC & TYPOGRAPHIC DIRECTIVES:
1. SOURCING & DICTIONARY AUTHORITY:
   - Your primary spelling reference must be Samdech Chuon Nath Dictionary (វចនានុក្រមសម្ដេចព្រះសង្ឃរាជ ជួន ណាត).
   - Ensure consonant subscript sequences (ជើងអក្សរ) are correctly specified. Catch lazy shorthand phonetic patterns and correct them (e.g. 'ផ្នើ' vs 'ផ្ញើ').

2. TYPOGRAPHY AND UNICODE ORDERING:
   - Examine the hidden rendering mechanics. Designers often type Khmer glyphs incorrectly in the background, causing broken diacritics, orphaned subscripts, or overlapping symbols (evident visually by red blocks or a gray dotted circle ◌ under vowels or diacritics).
   - Strict Unicode character sequence: Consonant + Subscript + Robat + Vowel (Srak) + Diacritic. Alert if visual placement seems correct but the character stream is invalid.

3. SPACING & PHRASING EXCELLENCE (ការដកឃ្លា):
   - Khmer does not utilize spaces between every word, but rather between syntactic clauses, ideas, and punctuation.
   - Detect "Word Splitting" errors: when designers accidentally put empty spaces in the middle of a continuous word due to automated line wrapping or manual typesetting (e.g. 'កា ហ្វេរ' or 'សេ វាកម្ម' instead of 'កាហ្វេ' or 'សេវាកម្ម').
   - Identify "Missing Breathability" errors: blocks with zero spaces that look excessively packed and require elegant structural spacing to be visually pleasing on a high-end designer banner.

4. COPYWRITING & MARKETING TONE:
   - Provide highly catchy, polished, professional copywriting alternatives (headings, subheadings, or hooks) that better fit the visual theme of the poster and respect proper Khmer syntax.

5. METICULOUS DOUBLE-PASS IMAGE SCAN (OCR PRECISENESS):
   - You must scan the entire visual field from top-to-bottom and left-to-right.
   - DO NOT omit small text markers like phone numbers (e.g., 012-345-678), prices ($1.5, 5000៛), percentages (50%), addresses, hashtags, or social handles. Capture and audit them regardless of size.
   - Carefully map boundingbox coordinates as percentage offsets relative to the image size (x: starting point from left, y: starting point from top, width: text width, height: text height).

${rulesPromptSegment}

Return the entire analysis STRICTLY formatted according to the provided JSON Schema. Do not wrap in markdown text blocks outside the JSON itself. Make explanations extremely descriptive. Ensure all text outputs use normalized standard Khmer Unicode.`;

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
    const errStr = String(error.message || error || "");
    const isLeaked = errStr.toLowerCase().includes("leaked") || errStr.toLowerCase().includes("permission_denied") || errStr.includes("403");
    return {
      statusCode: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify({
        error: isLeaked ? "API_KEY_LEAKED" : "Failed to process image.",
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
