import { pool as db } from '../db/db.js';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
    const { name, email, password } = req.body;
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
        const hash = await bcrypt.hash(password, 10);
        const insertSql = 'INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)';
        const [insertResult] = await db.execute(insertSql, [userId, name, email, hash]);

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
        res.cookie("token", token);

        res.status(201).json({ message: "New user created" });
    } catch (error) {
        console.error(error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "User Already Exists" });
        }
        res.status(500).json({ error: "Failed to create user" });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length == 0) {
            return res.status(409).json({ message: 'User is not registered with us please create an account' });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({ id: existingUser[0].id }, process.env.JWT_SECRET);

        res.cookie("token", token);

        res.status(200).json({ message: "User login successfull" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to login user" });
    }
}

export const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}