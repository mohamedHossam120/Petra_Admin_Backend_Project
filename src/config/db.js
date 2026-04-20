const mysql = require('mysql2/promise'); // استخدم نسخة الـ promise مباشرة أسرع وأخف
const dotenv = require('dotenv');
dotenv.config();

// إنشاء الـ Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306, // المنفذ الافتراضي لـ MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // وقت انتظار 10 ثواني (مهم جداً لـ Vercel)
});

const connectDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL Connected Successfully!');
        connection.release(); 
    } catch (error) {
        console.error(`❌ MySQL Connection Error: ${error.message}`);
    }
};

module.exports = { connectDB, db };