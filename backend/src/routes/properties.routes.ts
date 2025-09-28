import { Router } from "express"
import { authenticate } from "../middlewares/auth.middleware"
import multer from "multer";

const upload = multer(); 

import {
    createProperty,
    deleteProperty,
    getAllProperties,
    getPropertiesByUser,
    getPropertyById,
    updateProperty
} from "../controllers/property.controller"
import { ownerOrAdmin } from "../middlewares/role.middleware"

const router = Router()

// נכסים

// יצירת נכס
router.post("/:id", authenticate, upload.array("images", 20), createProperty)
// כל הנכסים 
router.get("/", getAllProperties)
// נכס לפי משתמש מסוים
router.get("/user/:id", getPropertiesByUser)
// נכס ספציפי
router.get("/:id", getPropertyById)
//  עידכון נכס
router.put("/:id", authenticate, ownerOrAdmin, upload.array("images", 20), updateProperty)
// מחיקת נכס
router.delete("/:id", authenticate, ownerOrAdmin, deleteProperty)

// צריך לעשות בדיקות על יצירה ועידכון מערך שגיאות
export default router