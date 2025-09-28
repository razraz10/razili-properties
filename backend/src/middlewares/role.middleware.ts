import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { Property } from "../models/Property";


export const ownerOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const property = await Property.findById(req.params.id)
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // אם המשתמש הוא אדמין או בעל הנכס
        if (req.user.role === "admin" || property.owner.toString() === req.user.id) {
            return next();
        }

        return res.status(403).json({ message: "Forbidden: not owner or admin" });

    } catch (err) {
        res.status(500).json({ message: "Error checking ownership", error: err });
    }
}