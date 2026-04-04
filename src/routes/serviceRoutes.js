const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const serviceCtrl = require('../controllers/serviceController');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petra_services', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
        resource_type: 'auto', 
    },
});

const upload = multer({ storage });


router.post('/add', upload.single('image'), serviceCtrl.addService);

router.get('/all', serviceCtrl.getAllServices);


router.get('/get/:id', serviceCtrl.getServiceById);

router.get('/sub/:subId', serviceCtrl.getServicesBySubCategory);

router.put('/update/:id', upload.single('image'), serviceCtrl.updateService);

router.delete('/delete/:id', serviceCtrl.deleteService);

module.exports = router;