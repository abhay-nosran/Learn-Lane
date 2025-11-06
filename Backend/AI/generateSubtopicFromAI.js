// will get the meta data

    // meta: {
    //   level: Number,
    //   parentId: { type: mongoose.Schema.Types.ObjectId, ref: "subtopic", default: null },
    //   topicId: { type: mongoose.Schema.Types.ObjectId, ref: "topic", default: null },
    //   context: String,
    //   generationGoal: String,
    //   experienceLevel: {
    //     type: String,
    //     enum: ["Beginner", "Intermediate", "Advanced"],
    //   },
    //   timelinePortion: Number,
    //   additionalHints: Object,
    // },
// async function generateSubtopicFromAI(meta){
    

//     const response = {
//   "type": "group",
//   "children": [
//     {
//       "name": "Arithmetic Progression (AP)",
//       "meta": {
//         "level": 1,
//         "parentId": "<id_of_Class_10_Math>",
//         "context": "Explain concepts of AP for Class 10 students including nth term and sum of n terms.",
//         "generationGoal": "Outline key subtopics and formulas for AP",
//         "experienceLevel": "Student",
//         "timelinePortion": 0.15
//       }
//     },
//     {
//       "name": "Circles",
//       "meta": {
//         "level": 1,
//         "parentId": "<id_of_Class_10_Math>",
//         "context": "Describe circle geometry including tangents, chords, and theorems for Class 10 students.",
//         "generationGoal": "Generate theoretical explanation and examples",
//         "experienceLevel": "Student",
//         "timelinePortion": 0.1
//       }
//     },
//     {
//       "name": "Trigonometry",
//       "meta": {
//         "level": 1,
//         "parentId": "<id_of_Class_10_Math>",
//         "context": "Trigonometric ratios, identities, and applications for Class 10 students.",
//         "generationGoal": "Generate content with formulas and examples",
//         "experienceLevel": "Student",
//         "timelinePortion": 0.12
//       }
//     }
//   ]
// }
//     return response ;
// }


// generateSubtopicFromAI.js
const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({apiKey : process.env.GEMINI_API_KEY});

/**
 * Input: meta {
 *   level:Number, parentId:ObjectId, topicId:ObjectId, context:String,
 *   generationGoal:String, experienceLevel:"Beginner"|"Intermediate"|"Advanced",
 *   timelinePortion:Number, additionalHints:Object
 * }
 * Output:
 *  - Data node: { type:"data", content:string }
 *  - Group node: { type:"group", children:[{ name, meta:{ context, generationGoal, timelinePortion, additionalHints } }] }
 */
async function generateSubtopicFromAI(meta) {
  const budget = Number(meta?.timelinePortion) > 0 ? Number(meta.timelinePortion) : 1;

  const systemSpec = {
    instruction: "Decide whether this node should be 'data' or 'group' based on meta.context and meta.generationGoal.",
    constraints: [
      "Return JSON only. No prose.",
      "If data: {\"type\":\"data\",\"content\":\"...\"}.",
      "If group: {\"type\":\"group\",\"children\":[{\"name\":\"...\",\"meta\":{\"context\":\"...\",\"generationGoal\":\"...\",\"timelinePortion\":number,\"additionalHints\":object}}]}",
      "Do not include parentId or topicId anywhere in your output.",
      "experienceLevel is reference-only. Do not copy it into children.",
      "Children count should be 2–7 when type is group.",
      "timelinePortion numbers should be positive."
    ]
  };

  const userPayload = {
    meta: {
      level: meta.level,
      // parentId/topicId intentionally omitted from what we send explicitly to steer model
      context: meta.context,
      generationGoal: meta.generationGoal,
      experienceLevel: meta.experienceLevel,
      timelinePortion: budget,
      additionalHints: meta.additionalHints || {}
    },
    examples: [
      {
        when: "Meta is highly specific and asks for final explanations or examples.",
        then: { type: "data", content: "…" }
      },
      {
        when: "Meta is broad and asks to outline or break down into sub-areas.",
        then: {
          type: "group",
          children: [
            {
              name: "Subtopic A",
              meta: {
                context: "…",
                generationGoal: "…",
                timelinePortion: 0.3,
                additionalHints: {}
              }
            }
          ]
        }
      }
    ]
  };

  const contents = [
    "You are an API that returns strict JSON.",
    JSON.stringify(systemSpec),
    "Input:",
    JSON.stringify(userPayload)
  ].join("\n");

  try {
    const resp = await genAI.models.generateContent({model: "gemini-2.5-flash",contents});
    console.log(resp)
    const text = resp.text.trim();

    // Hard-parse to JSON
    const ai = safeParseJson(text);

    // Validate shape and normalize if needed
    const normalized = normalize(ai, budget);

    return normalized;
  } catch (err) {
    console.error("AI generation failed:", err);
    // Minimal fallback to avoid breaking callers
    return { type: "data", content: meta?.context || "Content unavailable." };
  }
}

/* ---------- helpers ---------- */

function safeParseJson(s) {
  // Remove potential code fences
  const cleaned = s.replace(/^[\s`]*json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract first JSON object/array
    const m = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Non-JSON response from model");
  }
}

function normalize(ai, budget) {
  if (!ai || typeof ai !== "object" || !ai.type) {
    throw new Error("Invalid AI shape");
  }

  if (ai.type === "data") {
    if (typeof ai.content !== "string" || !ai.content.trim()) {
      ai.content = "Content not provided.";
    }
    return { type: "data", content: ai.content };
  }

  if (ai.type === "group") {
    const children = Array.isArray(ai.children) ? ai.children : [];
    if (children.length === 0) {
      // Degenerate case → convert to data
      return {
        type: "data",
        content: "No children generated."
      };
    }

    // Strip any parentId/topicId if model added them
    const cleaned = children.map((c) => ({
      name: String(c?.name || "Untitled").trim(),
      meta: {
        context: c?.meta?.context ?? "",
        generationGoal: c?.meta?.generationGoal ?? "",
        timelinePortion: numOrZero(c?.meta?.timelinePortion),
        additionalHints: isPlainObject(c?.meta?.additionalHints) ? c.meta.additionalHints : {}
      }
    }));

    // Ensure positive weights
    let sum = cleaned.reduce((acc, c) => acc + (c.meta.timelinePortion > 0 ? c.meta.timelinePortion : 0), 0);

    // If sum is zero or invalid, assign equal weights
    if (!(sum > 0)) {
      const equal = budget / cleaned.length;
      cleaned.forEach((c) => (c.meta.timelinePortion = equal));
    } else {
      // Scale to budget
      const scale = budget / sum;
      cleaned.forEach((c) => (c.meta.timelinePortion = c.meta.timelinePortion * scale));
    }

    return { type: "group", children: cleaned };
  }

  // Unknown type → coerce to data
  return { type: "data", content: "Unrecognized type in AI response." };
}

function numOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isPlainObject(o) {
  return o && typeof o === "object" && !Array.isArray(o);
}

async function test(){
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "How does AI work?",
  });
  console.log(response.text);
}

module.exports = generateSubtopicFromAI;
