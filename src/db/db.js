import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true
});

const createConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database Connection Successfull");
        connection.release();
    } catch (error) {
        console.error("Connection Error", error.message);
    }
}

export { pool, createConnection };