const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const checkUserExists = async (email) => {
    const [rows] = await db.execute('SELECT user_id FROM users WHERE user_email = ?', [email]);
    return rows.length > 0;
};

exports.registerCustomer = async (req, res) => {
    const { 
        user_frist_name, 
        user_last_name, 
        user_phone, 
        user_email, 
        user_pass, 
        user_role, 
        user_status, 
        user_address 
    } = req.body;

    try {
        const checkSql = 'SELECT * FROM users WHERE user_email = ?';
        const [existingUser] = await db.execute(checkSql, [user_email || null]); 

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is already registered." 
            });
        }

        const values = [
            user_frist_name || null,
            user_last_name || null,
            user_phone || null,
            user_email || null,
            user_pass || null, 
            user_role || 'customer',
            user_status || 'active',
            user_address || null
        ];

        const sql = `INSERT INTO users 
            (user_frist_name, user_last_name, user_phone, user_email, user_pass, user_role, user_status, user_address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(sql, values);

        res.status(201).json({ 
            success: true, 
            message: "Registration successful!" 
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during registration", 
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE user_email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.user_pass))) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid login credentials" 
            });
        }

        if (user.user_status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: `Account is ${user.user_status}` 
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.user_id, role: user.user_role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        return res.status(200).json({ 
            success: true,
            token, 
            role: user.user_role, 
            name: user.user_name, 
            id: user.user_id,
            image: user.profile_image 
        });
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, user_name, user_email, user_role, user_status, user_phone, profile_image FROM users');
        return res.status(200).json(rows);
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
};

exports.updateUser = async (req, res) => {
    const { name, phone, city, address } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const userId = req.params.id;

    try {
        let sql = `UPDATE users SET user_name=?, user_phone=?, user_city=?, user_address=?`;
        let params = [name, phone, city, address];

        if (imagePath) {
            sql += `, profile_image=?`;
            params.push(imagePath);
        }

        sql += ` WHERE user_id=?`;
        params.push(userId);

        await db.execute(sql, params);
        return res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully" 
        });
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute(`DELETE FROM users WHERE user_id = ?`, [id]);
        return res.status(200).json({ 
            success: true, 
            message: "User deleted successfully" 
        });
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Error deleting user", 
            error: err.message 
        });
    }
};