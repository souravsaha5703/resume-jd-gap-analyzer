import { llm } from '../config/llm.config.js';
import { resumeSchema, jdSchema, analysisSchema } from '../schemas/schema.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const generateStructuredDataFromResume = async (resumeText) => {
    const structuredLlm = llm.withStructuredOutput(resumeSchema, {
        name: 'extract-resume-data',
    });

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are an expert resume parser. Extract structured information from the resume text accurately. Do not invent information that isn't present."
        ],
        ["human", "Resume text \n \n {resume_text}"]
    ]);

    const chain = prompt.pipe(structuredLlm);

    const result = await chain.invoke({ resume_text: resumeText });
    return result;
}

export const generateStructuredDataFromJd = async (jd) => {
    const structuredLlm = llm.withStructuredOutput(jdSchema, {
        name: 'extract-jd-data',
    });

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are an expert at parsing job descriptions. Distinguish clearly between must-have and nice-to-have requirements based on the language used (e.g., 'required' vs 'preferred')."
        ],
        ["human", "Resume text \n \n {jd_text}"]
    ]);

    const chain = prompt.pipe(structuredLlm);

    const result = await chain.invoke({ jd_text: jd });
    return result;
}

export const generateStructuredAnalysis = async (resumeData, jdData) => {
    const structuredLlm = llm.withStructuredOutput(analysisSchema, {
        name: 'gap-analysis',
    });

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `You are an experienced technical recruiter and career coach. Your job is to compare a candidate's resume against a job description and produce an honest, specific gap analysis.

            Follow these rules strictly:

            1. MATCH SCORE: Give a score from 0-100 reflecting overall fit. Weight must-have skills heavily (missing even 2-3 must-haves should meaningfully lower the score). Nice-to-have skills matter less. A candidate missing most must-haves should score below 40. A candidate meeting all must-haves and most nice-to-haves should score above 80. Do not default to a "safe" middle score like 60-70 out of caution — commit to a number that reflects the actual gap.

            2. MATCHED SKILLS: List skills/technologies that appear in both the resume and the JD's requirements, using the JD's terminology (not the resume's, if they differ slightly but mean the same thing).

            3. MISSING SKILLS: List skills the JD explicitly requires (must-have or nice-to-have) that do not appear anywhere in the resume — not even implied by related experience.

            4. PARTIAL MATCHES: List skills where the resume shows *related* but not *exact* experience. Example: JD wants "AWS Lambda" and resume mentions "AWS EC2, S3" but not Lambda specifically — that's a partial match, not a full match and not fully missing. Explain the gap briefly in the note.

            5. SUGGESTIONS: For each significant gap, give ONE of two suggestion types:
            - REWRITE suggestion: if the resume likely has the underlying experience but didn't phrase it in JD-matching terms (e.g., resume says "built APIs" but JD wants "RESTful API design" specifically — suggest making the terminology explicit).
            - LEARNING suggestion: if the resume shows no evidence the skill exists at all, suggest it as a genuine skill gap to address, not a phrasing issue.
            Be specific — reference the actual skill/requirement by name, not generic advice like "highlight your skills better."

            Do not hallucinate skills, experience, or requirements that are not present in the provided structured data. Base your analysis only on what is given.`,
        ],
        [
            "human",
            `Candidate's resume (structured):
            {resume_json}
                    
            Job description requirements (structured):
            {jd_json}
                    
            Analyze the fit between this resume and job description.`,
        ],
    ]);

    const chain = prompt.pipe(structuredLlm);

    const result = await chain.invoke({
        resume_json: JSON.stringify(resumeData, null, 2),
        jd_json: JSON.stringify(jdData, null, 2),
    });

    return result;
}