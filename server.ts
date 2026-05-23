import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure the API Key of Gemini is present or log a helpful message
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables. Mock fallbacks will be used.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_IF_NOT_CONFIGURED",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enlarge client payload limit for base64 image uploads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // API Route for healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route to process poster images (multimodal OCR + Khmer spelling & grammar correction)
  app.post("/api/ocr-check", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png", customRules = [] } = req.body;

      if (
        !imageBase64 ||
        imageBase64 === "https://example.com/placeholder-trigger-for-mock" ||
        imageBase64.startsWith("http://") ||
        imageBase64.startsWith("https://")
      ) {
        // Safe fallback demo data
        return res.json(getDemoAnalysis(mimeType, customRules));
      }

      if (!apiKey || apiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
        // Safe fallback demo data if no key is configured yet
        return res.json(getDemoAnalysis(mimeType, customRules));
      }

      // Convert standard clean base64 format (removing prefix if provided by client)
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const rulesPromptSegment = customRules.length > 0 
        ? `Additionally, strictly respect these custom corporate/brand dictionary rules during correction and vocabulary replacement:\n${customRules.map((r: any, i: number) => `- Replace "${r.term}" with "${r.replacement}" (Category: ${r.category})`).join("\n")}`
        : "";

      // Construct a highly detailed OCR + Grammar checking instruction set for Gemini
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

      // Safeguard parsing
      const jsonResponse = JSON.parse(resultText);
      res.json(jsonResponse);

    } catch (error: any) {
      console.error("OCR and Correction API Error:", error);
      const errStr = String(error.message || error || "");
      const isLeaked = errStr.toLowerCase().includes("leaked") || errStr.toLowerCase().includes("permission_denied") || errStr.includes("403");
      res.status(500).json({
        error: isLeaked ? "API_KEY_LEAKED" : "Failed to process image.",
        details: error.message || error
      });
    }
  });

  // API Route for isolated text smart rewrite & tone conversion
  app.post("/api/smart-rewrite", async (req, res) => {
    try {
      const { text, tone, lengthMode = 'maintain', brandVocabulary = [] } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No target text supplied." });
      }

      if (!apiKey || apiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
        // Mock fallback if environment key is blank
        return res.json(getDemoRewrite(text, tone, lengthMode));
      }

      const vocabularyInstructions = brandVocabulary.length > 0
        ? `Adhere to corporate terminology definitions: ${brandVocabulary.map((v: any) => `replace "${v.term}" with "${v.replacement}"`).join(", ")}.`
        : "";

      const systemInstruction = `You are an elite Khmer Copywriter, specialized in marketing, brand design, and editorial proofing.
Your goal is to optimize Khmer copy to make it exceptionally professional, punchy, grammatical, and suited for high-impact visual design.

CRITICAL COPYWRITING DIRECTIVES:
- Dictated Tone Matching: If "luxury" is chosen, utilize high-register elegant vocabulary (e.g., "ជូន" instead of "ថែម", "លំដាប់អន្តរជាតិ"). If "youthful" is chosen, craft trendy, upbeat, yet grammatical expressions. If "formal", strictly respect national spelling standards (Chuon Nath Dictionary).
- Visual Length Economy: If lengthMode is "shorten", extract the absolute core message and formulate it into a punchy slogan to fit crowded flyers.
- Spacing & Rhythm: Ensure correct semantic phrasing and appropriate breathing spaces (ការដកឃ្លា) to guarantee instant readability.

${vocabularyInstructions}

Provide a JSON object containing:
- "rewrittenText": the newly adjusted, polished copywriting in Khmer Unicode.
- "explanation": a detailed semantic explanation in native Khmer/English explaining your linguistic improvements and spacing choices.
- "score": a number from 0 to 100 assessing the marketing force.
- "benefits": a string array highlighting 2 reasons why this rewritten slogan hits target user emotions.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Input Text: "${text}"\nTarget Tone: "${tone}"\nLength Constraint: "${lengthMode}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rewrittenText: { type: Type.STRING },
              explanation: { type: Type.STRING },
              score: { type: Type.INTEGER },
              benefits: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["rewrittenText", "explanation", "score", "benefits"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);

    } catch (error: any) {
      console.error("Smart Rewrite API Error:", error);
      const errStr = String(error.message || error || "");
      const isLeaked = errStr.toLowerCase().includes("leaked") || errStr.toLowerCase().includes("permission_denied") || errStr.includes("403");
      res.status(500).json({
        error: isLeaked ? "API_KEY_LEAKED" : "Failed to perform Smart Rewrite.",
        details: error.message || error
      });
    }
  });

  // Mount Vite middleware in development (when process.env.NODE_ENV !== "production")
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Khmer Proofing Workspace Server running securely on http://0.0.0.0:${PORT}`);
  });
}

// Demo fallbacks to support seamless preview experience if API variables are empty
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
      },
      {
         id: "item_2",
         originalText: "ហាងយើងខ្ញុំមានលក់បាយ",
         correctedText: "ហាងយើងខ្ញុំមានលក់បាយ",
         boundingBox: { x: 10, y: 22, width: 80, height: 10 },
         category: "spelling",
         explanation: "ពាក្យ 'ខ្ញុំ' សរសេរខុសស្រះ ប្រើ 'ខ្ញុំ' (ស្រៈ ុំ) ជំនួស 'ខ្ញុំ' (ស្រៈ ុំ)។",
         alternatives: [
           "ហាងយើងខ្ញុំសូមស្វាគមន៍",
           "ពួកយើងមានលក់បាយនិងភេសជ្ជៈ"
         ],
         readabilityRating: "fair",
         fontReadabilityWarning: "Stylized modern cursive font can block letter readability at a distance."
      },
      {
         id: "item_3",
         originalText: "COFFEE & TEA",
         correctedText: null,
         boundingBox: { x: 30, y: 4, width: 40, height: 8 },
         category: "ok",
         explanation: "Correctly capitalized English titles fit secondary design objectives perfectly.",
         alternatives: [],
         readabilityRating: "excellent",
         fontReadabilityWarning: null
      }
    ]
  };
}

function getDemoRewrite(text: string, tone: string, lengthMode: string): any {
  let rewrittenText = text;
  let explanation = "Adjusted according to formal spacing standards of the Khmer script.";
  let benefits = ["Evokes professionalism", "Ensures high grammatical accuracy"];
  let score = 90;

  if (text.includes("ទិញ")) {
    if (tone === "luxury") {
      rewrittenText = "សិល្បៈនៃការចម្អិនកាហ្វេដ៏វិសេសវិសាល ទិញ ១ ជូន ១";
      explanation = "Elevated lexical choices ('ជូន' instead of 'ថែម' & 'ដ៏វិសេសវិសាល') appropriate for the luxury market.";
      benefits = ["Attracts upper-market connoisseurs", "Builds strong reputation for craftsmanship"];
      score = 95;
    } else if (tone === "youthful") {
      rewrittenText = "ប្រូពិសេសម៉ងហាស! ទិញ ១ ថែម ១ ហ្វ្រីៗ!";
      explanation = "Uses casual colloquial particles ('ម៉ងហាស', 'ហ្វ្រីៗ') targeting Gen Z cafe lovers.";
      benefits = ["Creates instant street-level relatability", "Enormously shareable for feed posts"];
      score = 88;
    } else if (tone === "promotional") {
      rewrittenText = "ឱកាសពិសេស! ទិញ ១ ថែម ១ ចំនួនមានកំណត់!";
      explanation = "Emphasizes limited inventory and professional urgency markers.";
      benefits = ["Enhances click-through conversion rates", "Triggers psychological FOMO instantly"];
      score = 92;
    }
  }

  if (lengthMode === "shorten") {
    rewrittenText = rewrittenText.substring(0, 16) + "...";
  }

  return { rewrittenText, explanation, score, benefits };
}

startServer();
