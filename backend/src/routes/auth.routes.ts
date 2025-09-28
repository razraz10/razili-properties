import { Router } from "express";
import { register, login, logout, refresh } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";


const router = Router()

// יוזרים

// רישום משתמש חדש
router.post("/register", register)
// התחברות
router.post("/login", login)
// רענון טוקן
router.post("/refresh", refresh)
// יציאה
router.post("/logout", authenticate, logout); 


export default router