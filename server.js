const app=require("./src/app")
require("dotenv").config(); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`My app is running on port ${PORT}`);
    console.log(`Connected to Remote DB: 161.35.26.26`); 
});