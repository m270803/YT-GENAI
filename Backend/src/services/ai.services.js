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

  const prompt = `Genrate resume for a candidate for a candidate with the followig details: 
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}
                     the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
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