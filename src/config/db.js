const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 2, // قلل الرقم ده جداً عشان متعملش زحمة على السيرفر
    queueLimit: 0,
    connectTimeout: 30000, // 30 ثانية انتظار
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

const connectDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Connected! Database is alive.');
        connection.release();
    } catch (error) {
        console.error('❌ Timeout/Connection Error:', error.message);
        // السيرفر مش هيموت هنا، هيفضل يحاول
    }
};

module.exports = { db, connectDB };