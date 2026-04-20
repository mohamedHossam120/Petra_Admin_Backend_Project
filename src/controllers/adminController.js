const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db'); 

exports.createAdmin = async (req, res) => {
    const { 
        user_first_name, 
        user_last_name, 
        user_email, 
        user_pass, 
        user_phone, 
        user_address,
        user_role,
        description 
    } = req.body;

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute('SELECT user_email FROM users WHERE user_email = ?', [user_email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: "This email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(user_pass, 10);

        const userSql = `INSERT INTO users 
            (user_first_name, user_last_name, user_email, user_pass, user_phone, user_address, user_role, user_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`;
        
        const [userResult] = await connection.execute(userSql, [
            user_first_name, 
            user_last_name, 
            user_email, 
            hashedPassword, 
            user_phone, 
            user_address, 
            user_role
        ]);

        const newUserId = userResult.insertId;

        const adminSql = `INSERT INTO admins (user_id, description) VALUES (?, ?)`;
        await connection.execute(adminSql, [newUserId, description || 'Petra System User']);

        await connection.commit();
        return res.status(201).json({ success: true, message: "Account created successfully" });

    } catch (err) {
        await connection.rollback();
        console.error("Database Error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    } finally {
        connection.release();
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = `
            SELECT u.*, a.description 
            FROM users u 
            LEFT JOIN admins a ON u.user_id = a.user_id 
            WHERE u.user_email = ?
        `;
        const [rows] = await db.execute(sql, [email]);

        if (rows.length === 0) return res.status(401).json({ success: false, message: "User not found" });

        const user = rows[0];

        const allowedRoles = ['admin', 'admin_user'];
        if (!allowedRoles.includes(user.user_role)) {
            return res.status(403).json({ success: false, message: "Access denied. Admin only." });
        }

        const isMatch = await bcrypt.compare(password, user.user_pass);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid password" });

        const token = jwt.sign(
            { id: user.user_id, role: user.user_role },
            process.env.JWT_SECRET || "petra_2026",
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            token,
            name: `${user.user_first_name} ${user.user_last_name}`.trim(),
            data: {
                role: user.user_role,
                description: user.description
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.getAdminUsers = async (req, res) => {
    try {
        const sql = `
            SELECT 
                user_id, user_first_name, user_last_name, 
                user_email, user_phone, user_address, 
                user_role, user_status, created_at 
            FROM users 
            WHERE user_role IN ('admin', 'admin_user')
            ORDER BY created_at DESC`;

        const [rows] = await db.execute(sql);

        return res.status(200).json({
            success: true,
            users: rows
        });
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching admins", 
            error: err.message 
        });
    }
};
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params; 
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute('DELETE FROM admins WHERE user_id = ?', [id]);

        const [result] = await connection.execute('DELETE FROM users WHERE user_id = ?', [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await connection.commit();
        return res.status(200).json({ success: true, message: "Admin deleted successfully" });

    } catch (err) {
        await connection.rollback();
        console.error("Delete Error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    } finally {
        connection.release();
    }
};
exports.updateAdmin = async (req, res) => {
    const { id } = req.params; 
    const { 
        user_first_name, 
        user_last_name, 
        user_email, 
        user_pass, 
        user_phone, 
        user_address,
        user_role,
        user_status,
        description 
    } = req.body;

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        let userSql = `
            UPDATE users 
            SET user_first_name = ?, user_last_name = ?, user_email = ?, 
                user_phone = ?, user_address = ?, user_role = ?, user_status = ?
        `;
        let params = [user_first_name, user_last_name, user_email, user_phone, user_address, user_role, user_status];

        if (user_pass && user_pass.trim() !== "") {
            const hashedPassword = await bcrypt.hash(user_pass, 10);
            userSql += `, user_pass = ?`;
            params.push(hashedPassword);
        }

        userSql += ` WHERE user_id = ?`;
        params.push(id);

        await connection.execute(userSql, params);

        const adminSql = `UPDATE admins SET description = ? WHERE user_id = ?`;
        await connection.execute(adminSql, [description || 'Petra System User', id]);

        await connection.commit();
        return res.status(200).json({ success: true, message: "User updated successfully" });

    } catch (err) {
        await connection.rollback();
        console.error("Update Error:", err);
        return res.status(500).json({ success: false, message: "Update failed", error: err.message });
    } finally {
        connection.release();
    }
};