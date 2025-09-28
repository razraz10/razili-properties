import { Request, Response } from "express";
import { User } from "../models/User"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import BlackList from "../models/BlackList";
import { CookieOptions } from "express";

const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  const isLocalhost = process.env.CLIENT_URL?.includes("localhost");

  if (isProduction) {
    // 🚀 Production אמיתי
    return {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  if (isLocalhost) {
    // 🖥️ Dev - Localhost
    return {
      httpOnly: true,
      secure: false,       // כי זה http://localhost
      sameSite: "strict",  // מותר, כי אין cross-site אמיתי
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  // 🌐 Dev עם HTTPS (למשל ngrok / 127.0.0.1 ב-https)
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none", // חובה כשמשתמשים עם secure:true
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};


const createAccessToken = (user: any) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

const createRefreshToken = (user: any) => {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
};


export const register = async (req: Request, res: Response) => {
    try {

        const { user_name, email, password, role } = req.body
        console.log(req.body);


        let errorsArray: string[] = [];

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            errorsArray.push("User already exists")
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorsArray.push("Invalid email format");
        }

        const passwordRegex = /^(?=.*[A-Za-z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            errorsArray.push("Password must be at least 8 characters and include at least one letter")
        }

        // אם יש שגיאות מחזירים
        if (errorsArray.length > 0) {
            return res.status(400).json({ errorsArray });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        console.log(user_name, " before save");
        const user = new User({
            user_name,
            email,
            password: hashedPassword,
            role: role || 'user'
        })

        await user.save()

        // יוצרים טוקן מיד אחרי ההרשמה
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        res.cookie("refreshToken", refreshToken, getCookieOptions());
        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, user_name: user.user_name, email: user.email },
            accessToken,
        });

    } catch (err) {
        res.status(500).json({ message: "server error", error: err })
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        let errorsArray: string[] = [];
        if (!email || !password) errorsArray.push("Please enter all fields");

        // חיפוש משתמש
        const user = await User.findOne({ email });
        if (!user) {
            errorsArray.push("No user found with this email");
        }

        // בדיקת סיסמה
        let isMatch = false;
        if (user && typeof user.password === "string") {
            isMatch = await bcrypt.compare(password, user.password);
        }
        if (!isMatch) {
            errorsArray.push("Wrong password");
        }

        if (errorsArray.length > 0) return res.status(400).json({ errorsArray });

        // יצירת טוקן
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        if (user) {
            res.cookie("refreshToken", refreshToken, getCookieOptions()).json({
                accessToken,
                user: { id: user._id, email: user.email, user_name: user.user_name },
            });
        } else {
            res.status(400).json({ errorsArray });
        }
        console.log(errorsArray, "dsfsdf");

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });

    }
}


// רענון טוקן
export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: "User not found" });

        const newAccessToken = createAccessToken(user);

        res.json({ accessToken: newAccessToken, user: { id: user._id, user_name: user.user_name, email: user.email } });
    } catch (err) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};


// יציאה מהמערכת
export const logout = async (req: Request, res: Response) => {
    let token = req.cookies?.refreshToken;

    if (token) await BlackList.create({ token });

    res.clearCookie("refreshToken").json({ message: "Logged out successfully" });
};
