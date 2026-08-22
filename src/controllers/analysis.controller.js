import { v4 as uuid } from 'uuid';
import { pool as db } from '../db/db.js';
import { generateStructuredAnalysis } from '../services/generateStructuredData.service.js';

export const getAnalysis = async (req, res) => {
    const { resumeId, jdId } = req.body;

    if (!resumeId || !jdId) {
        return res.status(400).json({ error: "resumeId and jobDescriptionId are required" });
    }

    try {
        const [existingResume] = await db.execute("SELECT * FROM resumes WHERE id = ?", [resumeId]);
        if (existingResume.length == 0 || existingResume[0].user_id !== req.user.id) {
            return res.status(404).json({ error: "Resume not found" });
        }

        const [existingJd] = await db.execute("SELECT * FROM job_descriptions WHERE id = ?", [jdId]);
        if (existingJd.length == 0 || existingJd[0].user_id !== req.user.id) {
            return res.status(404).json({ error: "Job description not found" });
        }

        if (!existingResume[0].structured_data || !existingJd[0].structured_data) {
            return res.status(400).json({ error: "Resume or job description has not finished processing yet" });
        }

        const gapAnalysisResult = await generateStructuredAnalysis(existingResume[0].structured_data, existingJd[0].structured_data);
        const analysisId = uuid();
        const userId = req.user.id;
        const insertSql = 'INSERT INTO analyses (id,user_id,resume_id,jd_id,match_score,matched_skills,missing_skills,partial_matches,suggestions) VALUES (?,?,?,?,?,?,?,?,?)';
        await db.execute(insertSql, [analysisId, userId, resumeId, jdId, gapAnalysisResult.match_score, gapAnalysisResult.matched_skills, gapAnalysisResult.missing_skills, gapAnalysisResult.partial_matches, gapAnalysisResult.suggestions]);

        const [analysisResult] = await db.execute('SELECT * FROM analyses WHERE id = ?', [analysisId]);
        res.status(201).json({
            status: 201,
            message: "Analysis generated",
            data: analysisResult[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate gap analysis" });
    }
}

export const getAllAnalyses = async (req, res) => {
    try {
        const userId = req.user.id;

        const [allAnalyses] = await db.execute('SELECT * FROM analyses WHERE user_id = ?', [userId]);

        if (allAnalyses.length == 0) {
            return res.status(409).json({ message: 'No gap analyses found' });
        }

        res.status(200).json({
            status: 200,
            message: "All gap analyses fetched",
            data: allAnalyses
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch gap analyses" });
    }
}