import { v4 as uuid } from 'uuid';
import { pool as db } from '../db/db.js';
import { PDFParse } from 'pdf-parse';
import { readFile, unlink } from 'node:fs/promises';
import { generateStructuredDataFromResume, generateStructuredDataFromJd } from '../services/generateStructuredData.service.js';

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        const original_filename = req.file.originalname;
        const bufferData = await readFile(req.file.path);
        const uint8ArrayData = new Uint8Array(bufferData.buffer, bufferData.byteOffset, bufferData.byteLength);

        const parser = new PDFParse(uint8ArrayData);
        const parsedResult = await parser.getText();
        const rawText = typeof parsedResult === 'string'
            ? parsedResult
            : (parsedResult.text || parsedResult.pages?.map(p => p.text).join('\n') || '');

        await unlink(req.file.path);

        const structuredData = await generateStructuredDataFromResume(rawText);

        await db.query(`
            CREATE TABLE IF NOT EXISTS resumes(
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                original_filename VARCHAR(100) NOT NULL,
                raw_text TEXT,
                structured_data JSON,
                version_number INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        const resumeId = uuid();
        const userId = req.user.id;
        const insertSql = 'INSERT INTO resumes (id,user_id,original_filename,raw_text,structured_data) VALUES (?,?,?,?,?)';
        await db.execute(insertSql, [resumeId, userId, original_filename, rawText, JSON.stringify(structuredData)]);

        res.status(201).json({
            status: 201,
            message: "Data parsed and successfully added to Database"
        });
    } catch (error) {
        if (req.file?.path) await unlink(req.file.path).catch(() => { });
        console.error(error);
        res.status(500).json({ error: 'Failed to process and save resume' });
    }
}

export const getAllResumes = async (req, res) => {
    try {
        const userId = req.user.id;

        const [allResumes] = await db.execute('SELECT * FROM resumes WHERE user_id = ?', [userId]);

        if (allResumes.length == 0) {
            return res.status(409).json({ message: 'No resume found' });
        }

        res.status(200).json({
            status: 200,
            message: "All resume fetched",
            allResumes
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch resumes" });
    }
}

export const uploadJd = async (req, res) => {
    const { jd, job_title, company_name } = req.body;

    try {
        const structuredJdData = await generateStructuredDataFromJd(jd);

        await db.query(`
            CREATE TABLE IF NOT EXISTS job_descriptions(
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                job_title VARCHAR(100),
                company_name VARCHAR(100),
                raw_text TEXT,
                structured_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        const jdId = uuid();
        const userId = req.user.id;
        const insertSql = 'INSERT INTO job_descriptions (id,user_id,job_title,company_name,raw_text,structured_data) VALUES (?,?,?,?,?,?)';
        await db.execute(insertSql, [jdId, userId, job_title?.trim() || "Untitled JD", company_name?.trim() || "Not provided", jd, structuredJdData]);

        res.status(201).json({ message: "JD parsed and successfully uploaded" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process job description' });
    }
}

export const getAllJds = async (req, res) => {
    try {
        const userId = req.user.id;

        const [allJds] = await db.execute('SELECT * FROM job_descriptions WHERE user_id = ?', [userId]);

        if (allJds.length == 0) {
            return res.status(409).json({ message: 'No job description found' });
        }

        res.status(200).json({
            status: 200,
            message: "All job descriptions fetched",
            allJds
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch job descriptions" });
    }
}