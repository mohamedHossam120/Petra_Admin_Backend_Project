const { db } = require('../config/db');

exports.addSubCategory = async (req, res) => {
    try {
        const { subcategory_name, category_id, subcategory_description } = req.body;

        if (!subcategory_name || !category_id) {
            return res.status(400).json({ 
                success: false, 
                message: "اسم القسم الفرعي ورقم القسم الرئيسي مطلوبان." 
            });
        }
        const sql = `INSERT INTO subcategories 
                     (subcategory_name, category_id, subcategory_description, subcategory_status) 
                     VALUES (?, ?, ?, 'active')`;
        
        const [result] = await db.execute(sql, [
            subcategory_name, 
            category_id, 
            subcategory_description || null
        ]);
        
        return res.status(201).json({ 
            success: true,
            message: "تمت إضافة القسم الفرعي بنجاح!",
            data: { 
                subcategory_id: result.insertId,
                subcategory_name, 
                category_id: Number(category_id), 
                subcategory_description,
                subcategory_status: 'active'
            }
        });

    } catch (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "خطأ في قاعدة البيانات", 
            error: err.message 
        });
    }
};
exports.getAllSubCategories = async (req, res) => {
    try {
        const sql = `
            SELECT 
                subcategory_id, 
                subcategory_name, 
                category_id, 
                subcategory_description, 
                subcategory_status 
            FROM subcategories 
            ORDER BY subcategory_id DESC
        `;

        const [rows] = await db.execute(sql);

        return res.status(200).json({ 
            success: true, 
            count: rows.length,
            data: rows 
        });
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching all subcategories", 
            error: err.message 
        });
    }
};


exports.getSubCategoriesByCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
            const sql = `
            SELECT 
                subcategory_id, 
                subcategory_name, 
                category_id, 
                subcategory_description, 
                subcategory_status 
            FROM subcategories 
            WHERE category_id = ? 
            ORDER BY subcategory_id DESC
        `;

        const [rows] = await db.execute(sql, [categoryId]);

        if (rows.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "لا توجد أقسام فرعية لهذا القسم حالياً.", 
                data: [] 
            });
        }

        return res.status(200).json({ 
            success: true, 
            count: rows.length,
            data: rows 
        });

    } catch (err) {
        console.error("🔴 Error fetching subcategories:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "خطأ في جلب الأقسام الفرعية", 
            error: err.message 
        });
    }
};
exports.deleteSubCategory = async (req, res) => {
    const { id } = req.params; 

    try {
        const [check] = await db.execute(
            'SELECT * FROM subcategories WHERE subcategory_id = ?', 
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "القسم الفرعي غير موجود بالفعل." 
            });
        }

        const sql = `DELETE FROM subcategories WHERE subcategory_id = ?`;
        await db.execute(sql, [id]);

        return res.status(200).json({ 
            success: true, 
            message: "تم حذف القسم الفرعي بنجاح!" 
        });

    } catch (err) {
        console.error("🔴 Delete Error:", err.message);
        
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: "لا يمكن حذف هذا القسم لأنه مرتبط بخدمات أو مقدمي خدمة." 
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: "خطأ في قاعدة البيانات أثناء الحذف", 
            error: err.message 
        });
    }
};
exports.updateSubCategory = async (req, res) => {
    const { id } = req.params; 
    const { subcategory_name, category_id, subcategory_description, subcategory_status } = req.body;

    try {
        const [sub] = await db.execute('SELECT * FROM subcategories WHERE subcategory_id = ?', [id]);
        if (sub.length === 0) {
            return res.status(404).json({ success: false, message: "القسم الفرعي غير موجود." });
        }

    
        const sql = `
            UPDATE subcategories 
            SET 
                subcategory_name = COALESCE(?, subcategory_name),
                category_id = COALESCE(?, category_id),
                subcategory_description = COALESCE(?, subcategory_description),
                subcategory_status = COALESCE(?, subcategory_status)
            WHERE subcategory_id = ?
        `;

        await db.execute(sql, [
            subcategory_name || null, 
            category_id || null, 
            subcategory_description || null, 
            subcategory_status || null, 
            id
        ]);

        return res.status(200).json({ 
            success: true, 
            message: "تم تحديث القسم الفرعي بنجاح!" 
        });

    } catch (err) {
        console.error("🔴 Update Error:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "خطأ في تعديل البيانات", 
            error: err.message 
        });
    }
};