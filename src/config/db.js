const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5, // قللنا العدد عشان السيرفر ميزهقش
    queueLimit: 0,
    connectTimeout: 20000 // زودنا الوقت لـ 20 ثانية عشان ندي فرصة للاتصال
});

// دالة بسيطة عشان نتأكد إن الدنيا تمام
const connectDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Database is back online!');
        connection.release();
    } catch (error) {
        console.error('❌ Connection still failing:', error.message);
        // مفيش process.exit هنا عشان السيرفر ميفصلش
    }
};

module.exports = { db, connectDB };