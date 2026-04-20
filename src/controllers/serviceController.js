const { db } = require('../config/db');

exports.addService = async (req, res) => {
    try {
        const { 
            name, category, sub_category, description, 
            price, max_price, admin_commission_rate, status 
        } = req.body;
        
        const image = req.file ? req.file.path : null;

        const sql = `INSERT INTO services 
            (name, category, sub_category, description, price, max_price, admin_commission_rate, image, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [
            name, 
            Number(category), 
            Number(sub_category), 
            description || null, 
            price || 0, 
            max_price || 0, 
            admin_commission_rate || 0, 
            image,
            status || 'active'
        ]);
        
        res.status(201).json({ 
            success: true, 
            message: "Service added successfully!",
            data: { id: result.insertId, name } 
        });
    } catch (err) {
        console.error("Add Service Error:", err); 
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const sql = `
            SELECT 
                s.id AS service_id, 
                s.name AS service_name, 
                s.description AS service_description,
                s.price AS service_price,
                s.max_price,
                s.admin_commission_rate,
                s.status AS service_status,
                s.image AS service_image,
                c.category_name, 
                sub.subcategory_name
            FROM services s
            LEFT JOIN categories c ON s.category = c.category_id
            LEFT JOIN subcategories sub ON s.sub_category = sub.subcategory_id
            ORDER BY s.id DESC
        `;
        
        const [rows] = await db.execute(sql);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error("DATABASE ERROR:", err); 
        res.status(500).json({ success: false, error: err.message }); 
    }
};

exports.getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM services WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error in getServiceById:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, max_price, admin_commission_rate, status } = req.body;
    
    try {
        let sql = `UPDATE services SET name=?, price=?, description=?, max_price=?, admin_commission_rate=?, status=?`;
        let params = [name, price, description, max_price, admin_commission_rate, status];

        if (req.file) {
            sql += `, image=?`;
            params.push(req.file.path);
        }

        sql += ` WHERE id=?`;
        params.push(id);

        await db.execute(sql, params);
        res.status(200).json({ success: true, message: "Service updated successfully!" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `DELETE FROM services WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.status(200).json({ success: true, message: "Service deleted successfully!" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getServicesBySubCategory = async (req, res) => {
    const { subId } = req.params;
    try {
        const sql = `SELECT * FROM services WHERE sub_category = ? ORDER BY id DESC`;
        const [rows] = await db.execute(sql, [subId]);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: "An error occurred while fetching services" });
    }
};