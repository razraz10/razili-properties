import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import BlackList from "../models/BlackList";


export interface AuthRequest extends Request {
    user?: { id: string; role: string }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const blacklisted = await BlackList.findOne({ token });
    if (blacklisted) {
        return res.status(401).json({ message: "Token invalid (logged out)" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
            id: string;
            role: string;
        }
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}