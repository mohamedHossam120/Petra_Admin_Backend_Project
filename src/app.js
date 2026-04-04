const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// استيراد الروابط (Routes)
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require("./routes/categoryRoutes"); 
const adminRoutes = require("./routes/adminRoures"); 
const adminuserRoutes = require("./routes/adminuserRoutes"); 
const subcategoryRoutes = require("./routes/subcategoryRoutes");
const serviceRoutes = require('./routes/serviceRoutes');

dotenv.config();
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static('uploads')); 

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/services', serviceRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/adminUser", adminuserRoutes); 

connectDB();

app.get("/", (req, res) => res.send("🚀 Petra API is running successfully on Remote Server..."));

module.exports = app;