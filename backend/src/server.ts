import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes"; 
import propertyRoutes from "./routes/properties.routes"; 
import cookieParser from "cookie-parser";

dotenv.config()

const app = express()

app.use(cors({
  origin: 'http://localhost:3000', // חייב להיות ה-origin של ה-frontend
  credentials: true,              // מאפשר שליחת cookies / auth headers
}));

app.use(express.json())
app.use(cookieParser())


// יצירת משתמש והרשאות
app.use("/api/auth", authRoutes)

// נכסים
app.use("/api/properties", propertyRoutes)

app.get("/", (req, res) => {
  res.send("🏠 Real Estate API is running...");
});


const PORT = process.env.PORT || 5000

connectDB().then(()=>{
    app.listen(PORT, ()=> console.log(`server run on port ${PORT}`))
})