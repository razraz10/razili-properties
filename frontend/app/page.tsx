'use client'

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useRouter } from "next/navigation";
import PopupProperty from "./components/PopupProperty";
import { Properties, PropertyCardProps } from "./types/interface";
import PropertyCard from "./components/PropertyCard";
import { useAuthStore } from "./store/authStore";

export default function Home() {
  const router = useRouter();

    const { user, token, refreshToken } = useAuthStore();


  // כל הנכסים
  const [data, setData] = useState<Properties[]>([]);
  // נכס אחד
  const [oneProperty, setOneProperty] = useState<Properties | null>(null);
  // טעינה
  const [loading, setLoading] = useState(true);
  // שגיאה
  const [error, setError] = useState<string | null>(null);

const [authInitialized, setAuthInitialized] = useState(false);

useEffect(() => {
  const initAuth = async () => {
    await useAuthStore.getState().initialize(); // אם הוספת פונקציית initialize ל-store
    setAuthInitialized(true); // עכשיו אפשר להראות רכיבים ולטעון נכסים
  };
  initAuth();
}, []);

  // --- טיפול בלחיצה על אייקון המשתמש ---
  const handleUserClick = async () => {
    if (!user) return router.push("/auth?mode=register"); // אין משתמש → רישום
    if (!token) return router.push("/auth?mode=login"); // יש משתמש אך לא מחובר → התחברות

    // const newToken = await refreshToken();
    // if (!newToken) return router.push("/auth?mode=login");
    
    router.push("/profile"); // אם הכל בסדר → פרופיל
  };


  // --- slugify url--- בשביל נכס אחד בפופאפ
  const slugify = (address: string) =>
    address
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\wא-ת0-9-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

  // --- Fetch כל הנכסים ---
  const getProperties = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/properties`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const getOneProperty = async (_id: string, replace: boolean) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/properties/${_id}`);
      openPropertyPopup(response.data, replace)
      console.log(response.data);
      
      // setData(response.data);
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת הנתונים");
      router.replace("/")
    } finally {
      setLoading(false);
    }
  };

  // --- פתיחת / סגירת פופאפ ---
  const openPropertyPopup = useCallback((property: Properties, replace = false) => {
    const slug = slugify(property.address);
    const url = `/?property=${slug}-${property._id}`;
    if (replace) router.replace(url);
    else router.push(url);
    setOneProperty(property);
  },
    [router]
  );

  const closePropertyPopup = () => {
    setOneProperty(null);
    router.replace("/");
  };

  // --- ניווט תמונות ---
  const handleNextImage = (propertyId: string) => {
    setData((prev) =>
      prev.map((p) =>
        p._id === propertyId
          ? { ...p, main_image_index: ((p.main_image_index ?? 0) + 1) % (p.images?.length || 1) }
          : p
      )
    );
  };
  const handlePrevImage = (propertyId: string) => {
    setData((prev) =>
      prev.map((p) =>
        p._id === propertyId
          ? {
            ...p,
            main_image_index:
              ((p.main_image_index ?? 0) - 1 + (p.images?.length || 1)) % (p.images?.length || 1),
          }
          : p
      )
    );
  };

  // --- טעינת נתונים ---
  useEffect(() => {
    if(authInitialized) {
      getProperties();

    }
  }, [authInitialized]);

  // --- בדיקה אם URL מכיל property לפופאפ ---
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const propertyParam = params.get("property");

      if (!propertyParam) {
        setOneProperty(null);
        return;
      }

      const id = propertyParam.split("-").pop();
      if (!id) return;

      // תמיד להביא נכס מלא מהשרת
      getOneProperty(id, true);
    };

    // להריץ פעם אחת בטעינה
    handleUrlChange();

    // האזנה ל־Back/Forward
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [router]);


  if (loading) return <p>טוען נכסים...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div dir="rtl" className="flex-1 p-4">
            <div className="w-full flex items-center gap-2 mb-4">
        <User className="cursor-pointer" onClick={handleUserClick} />
        {user && <span className="font-semibold">{user.user_name}</span>}
      <div className="w-full">
        <input 
        type="text" 
        className="w-full text-black bg-gray-200 rounded-sm px-2"
        placeholder="כתובת"
        />
      </div>
      </div>
      <h1 className="text-2xl font-bold flex justify-center mb-6">
        ברוכים הבאים לאתר מספר 1 בישראל לנכסים
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onClick={() => getOneProperty(property._id, false)}
            onNextImage={handleNextImage}
            onPrevImage={handlePrevImage}

          />
        ))}
      </div>

      {oneProperty && (
        <PopupProperty
          handleCloseModal={closePropertyPopup}
          selectedProperty={!!oneProperty}
          oneProperty={oneProperty}
        />
      )}
    </div>
  );
}