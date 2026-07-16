const { GoogleGenAI } = require("@google/genai");
const z = require("zod");
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  match_score: z.number().min(0).max(100),

  technical_questions: z.array(
    z.object({
      question: z.string(),
      category: z.string().optional(),
      intention: z.string().optional(),
      answer: z.string().optional(),
    })
  ),

  behavioral_questions: z.array(
    z.object({
      question: z.string(),
      category: z.string().optional(),
      intention: z.string().optional(),
      answer: z.string().optional(),
    })
  ),

  missing_skills: z.array(
    z.object({
      skill: z.string(),
      severity: z.string().optional(),
      notes: z.string().optional(),
    })
  ),

  preparation_plan: z.object({
    duration: z.string().optional(),
    focus_areas: z.array(z.string()).optional(),
    daily_breakdown: z.array(
      z.object({
        day: z.string().optional(),
        focus: z.string().optional(),
        topics: z.array(z.string()).optional(),
        tasks: z.array(z.string()).optional(),
      })
    ).optional(),
  }).optional(),

  title: z.string()
});

// Convert Zod -> JSON Schema
const interviewJsonSchema = z.toJSONSchema(interviewReportSchema);

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Generate a detailed interview report in JSON format.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return a JSON object with EXACTLY this structure:
{
  "match_score": number (0-100),
  "title": "string (short descriptive title for this interview report, e.g. 'Software Engineer Interview Prep - TechCorp')",
  "technical_questions": [
    {
      "question": "string",
      "category": "string",
      "intention": "string", 
      "answer": "string"
    },
    ... (10 questions total)
  ],
  "behavioral_questions": [
    {
      "question": "string",
      "category": "string",
      "intention": "string",
      "answer": "string"
    },
    ... (5 questions total)
  ],
  "missing_skills": [
    {
      "skill": "string",
      "severity": "low/medium/high",
      "notes": "string"
    },
    ... (list all missing skills)
  ],
  "preparation_plan": {
    "duration": "7 Days",
    "focus_areas": ["string", "string", ...],
    "daily_breakdown": [
      {
        "day": "Day 1",
        "focus": "string",
        "topics": ["string", "string", ...],
        "tasks": ["string", "string", ...]
      },
      ... (7 days total)
    ]
  }
}

Requirements:
- Generate a concise, descriptive "title" summarizing the role and/or company (e.g. "Data Engineer Interview Prep - Siemens Energy")
- Generate EXACTLY 10 technical questions relevant to the job
- Generate EXACTLY 5 behavioral questions
- Include ALL missing skills
- Create detailed 7-day preparation plan
- All fields must be strings or arrays of strings
- Return ONLY valid JSON, no markdown or extra text
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewJsonSchema,
    }
  });

  // Handle different response formats
  let responseText = '';
  if (response.output_text) {
    responseText = response.output_text;
  } else if (response.text) {
    responseText = response.text;
  } else if (response.content) {
    responseText = response.content;
  } else if (typeof response === 'string') {
    responseText = response;
  } else {
    throw new Error('Unexpected response format from AI');
  }

  // Remove markdown code blocks if present
  let cleanedResponse = responseText.trim();

  if (cleanedResponse.includes('```')) {
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }
  }

  // Fix common JSON issues
  // Replace unescaped newlines in string values with escaped newlines
  cleanedResponse = cleanedResponse.replace(/: "([^"]*)\n([^"]*)"/, ': "$1\\n$2"');
  // Handle multiple unescaped newlines
  cleanedResponse = cleanedResponse.replace(/: "([^"]*)\n([^"]*)"/g, ': "$1\\n$2"');

  // Remove trailing commas before ] or }
  cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1');

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('❌ JSON Parse Error:', error.message);
    console.error('❌ Problem at position:', error.message.match(/position \d+/) ? error.message.match(/position \d+/)[0] : 'unknown');
    console.error('❌ Raw response length:', responseText.length);
    console.error('❌ Cleaned response length:', cleanedResponse.length);
    // Log the problematic section
    const errorPos = error.message.match(/position (\d+)/);
    if (errorPos) {
      const pos = parseInt(errorPos[1]);
      const start = Math.max(0, pos - 200);
      const end = Math.min(cleanedResponse.length, pos + 200);
      console.error('❌ Context around error:', cleanedResponse.substring(start, end));
    }
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume can be converted to PDF using any library like puppeteer ")
  })

  const resumePdfJsonSchema = z.toJSONSchema(resumePdfSchema)

const prompt = `You are an expert resume writer and career coach with 15+ years of experience helping candidates land interviews at top companies. Write a tailored, ATS-friendly resume in HTML.

## CANDIDATE INPUT
Existing Resume: ${resume}
Self Description: ${selfDescription}
Target Job Description: ${jobDescription}

## TASK
1. Analyze the job description and extract the top 8-10 keywords/skills/qualifications the employer cares about most.
2. Rewrite and reorder the candidate's existing experience/projects/skills to foreground whatever is most relevant to those keywords — without fabricating experience, tools, or metrics that aren't supported by the input.
3. Where the candidate's resume has vague bullet points, rewrite them using a strong-verb + action + measurable-result structure (e.g., "Reduced API response time by 40% by implementing Redis caching" instead of "Worked on backend optimization").

## WRITING STYLE (avoid sounding AI-generated)
- No generic filler phrases: "results-driven," "team player," "passionate about," "proven track record," "dynamic professional," "leverage synergies"
- No repeated sentence structures across bullets (vary verb choice and sentence length)
- Prefer specific nouns over abstractions (name the actual tech, metric, or outcome instead of vague claims)
- Write the way a sharp engineer would describe their own work to a peer, not the way a marketing bio would

## ATS COMPATIBILITY RULES
- Use standard section headings: "Experience," "Education," "Skills," "Projects" (not creative alternatives)
- No tables, no text inside images, no multi-column layouts that break text order
- No icons or symbols in place of text labels
- Use semantic HTML (<h1>-<h3>, <ul>/<li>, <p>) — never rely on visual position alone to convey structure
- All dates in a consistent, parsable format (e.g., "Jan 2024  Present")
- Contact info as plain text at the top, not in a header/footer element

## HTML/CSS OUTPUT REQUIREMENTS (for Puppeteer → PDF)
- Return a single self-contained HTML document with inline <style> in the <head> — no external stylesheets or fonts requiring network access
- Use @page { size: A4; margin: ... } and print-safe units (pt or in, not vh/vw)
- Font stack must be system-safe: e.g. 'Georgia, serif' or 'Arial, Helvetica, sans-serif'
- Use at most one accent color (dark navy, dark teal, or maroon — no bright colors) for name/section headers only; body text stays black/dark gray for print+ATS safety
- Font sizes: name 20-22pt, section headers 12-13pt bold/uppercase with a bottom border, body text 10-10.5pt, tight but readable line-height (1.15-1.3)
- Must fit within 1 page (2 only if candidate has 8+ years experience or extensive relevant projects) — control this via content selection, not by shrinking font below 9.5pt

## LENGTH & PRIORITIZATION
- Prioritize: relevant experience > relevant projects > skills > education > everything else
- Cut or compress anything with low relevance to the job description rather than shrinking font/margins to fit everything
- Aim for 4-6 bullets per role, 2-3 per project

## OUTPUT FORMAT
Return ONLY a valid JSON object, no markdown code fences, no explanation text before or after:
{"html": "<!DOCTYPE html>..."}
`
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumePdfJsonSchema,
    }
  })

  const jsonContent = JSON.parse(response.text)

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

  return pdfBuffer
}

module.exports ={ generateInterviewReport, generateResumePdf};