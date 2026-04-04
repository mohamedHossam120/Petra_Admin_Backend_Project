const { db } = require('../config/db');


exports.addCategory = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "لم تصل بيانات، تأكد من إعدادات form-data في Postman." 
            });
        }

        const { category_name, category_status, category_description } = req.body;
        
        const category_image = req.file ? req.file.path : null;

        if (!category_name) {
            return res.status(400).json({ success: false, message: "حقل الاسم مطلوب." });
        }

        const sql = `INSERT INTO categories (category_name, category_status, category_image, category_description) VALUES (?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [
            category_name, 
            category_status || 'active', 
            category_image, 
            category_description || null
        ]);
        
        return res.status(201).json({ 
            success: true,
            message: "تمت إضافة الفئة بنجاح!",
            data: { 
                category_id: result.insertId, 
                category_name: category_name, 
                category_image: category_image,
                category_status: category_status || 'active'
            }
        });

    } catch (err) {
        console.error("🔴 Backend Error:", err); 
        return res.status(500).json({ 
            success: false, 
            message: "خطأ في قاعدة البيانات", 
            error: err.message 
        });
    }
};
exports.getAllCategories = async (req, res) => {
    try {
        const sql = `
            SELECT 
                category_id, 
                category_name, 
                category_description, 
                category_image, 
                category_status 
            FROM categories 
            ORDER BY category_id DESC
        `;

        const [rows] = await db.execute(sql);

        return res.status(200).json({ 
            success: true, 
            count: rows.length, 
            data: rows 
        });

    } catch (err) {
        console.error("🔴 Error in getAllCategories:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "خطأ في جلب بيانات الأقسام", 
            error: err.message 
        });
    }
};
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category_name, category_description, category_status } = req.body;
    
    const category_image = req.file ? req.file.path : null;

    try {
        const [cat] = await db.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
        if (cat.length === 0) {
            return res.status(404).json({ success: false, message: "القسم غير موجود." });
        }

        const sql = `
            UPDATE categories 
            SET 
                category_name = COALESCE(?, category_name),
                category_description = COALESCE(?, category_description),
                category_status = COALESCE(?, category_status),
                category_image = COALESCE(?, category_image)
            WHERE category_id = ?
        `;

        await db.execute(sql, [
            category_name || null,
            category_description || null,
            category_status || null,
            category_image, 
            id
        ]);

        return res.status(200).json({ success: true, message: "تم تحديث القسم بنجاح!" });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `DELETE FROM categories WHERE category_id = ?`;
        await db.execute(sql, [id]);
        return res.status(200).json({ success: true, message: "تم حذف القسم بنجاح!" });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: "لا يمكن حذف هذا القسم لأنه يحتوي على أقسام فرعية مرتبطة به." 
            });
        }
        return res.status(500).json({ success: false, error: err.message });
    }
};