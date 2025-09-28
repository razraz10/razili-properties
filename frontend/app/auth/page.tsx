'use client'

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { Loader } from "lucide-react";

interface Errors {
  email?: string;
  user_name?: string;
  password?: string;
  general?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [user_name, setUser_name] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let res;
      if (mode === "login") {
        res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
        console.log(res);
        
      } else  {
        res = await axios.post("http://localhost:5000/api/auth/register", { user_name, email, password });
      }

      login(res.data.user, res.data.accessToken);
      router.push("/");
    } catch (err: any) {
      if (err.response?.data?.errorsArray) {
        console.log(err);
        
        // ממפה את השגיאות לפי תוכן להופעה מתחת לשדה הנכון
        const newErrors: Errors = {};
        err.response.data.errorsArray.forEach((msg: string) => {
          if (msg.toLowerCase().includes("user") || msg.toLowerCase().includes("email")) newErrors.email = msg;
          else if (msg.toLowerCase().includes("name")) newErrors.user_name = msg;
          else if (msg.toLowerCase().includes("password")) newErrors.password = msg;
          else newErrors.general = msg;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: "שגיאה בשרת" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{mode === "login" ? "התחברות" : "רישום"}</h2>

        {mode === "register" && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="שם מלא"
              className="w-full p-2 border rounded"
              value={user_name}
              onChange={(e) => setUser_name(e.target.value)}
              required
            />
            {/* {errors.user_name && <p className="text-red-600 text-sm mt-1">{errors.user_name}</p>} */}
          </div>
        )}

        <div className="mb-3">
          <input
            type="email"
            placeholder="אימייל"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="סיסמה"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
        </div>

        {errors.general && <p className="text-red-600 mb-2">{errors.general}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <div className="loader mx-auto">
                <Loader className="animate-spin mx-auto" />
            </div>
          ) : mode === "login" ? "התחבר" : "הרשם"}
        </button>

        <p className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <span>
              אין לך חשבון?{" "}
              <button
                type="button"
                className="text-blue-600 underline cursor-pointer"
                onClick={() => router.push("/auth?mode=register")}
              >
                הרשם
              </button>
            </span>
          ) : (
            <span>
              כבר יש לך חשבון?{" "}
              <button
                type="button"
                className="text-blue-600 underline cursor-pointer"
                onClick={() => router.push("/auth?mode=login")}
              >
                התחבר
              </button>
            </span>
          )}
        </p>
      </form>
    </div>
  );
}
