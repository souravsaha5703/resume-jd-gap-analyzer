import { pool as db } from '../db/db.js';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users(
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        const userId = uuid();
        const hash = await bcrypt.hash(req.body.password, 10);
        const insertSql = 'INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)';
        const [insertResult] = await db.execute(insertSql, [userId, req.body.name, req.body.email, hash]);

        res.status(200).json({ message: "New user created" });
    } catch (error) {
        console.error(error.message);
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({message:"User Already Exists"});
        }
        res.status(500).json({ error: "Failed to create user" });
    }
}