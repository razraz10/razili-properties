'use client'
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { useCallback, useEffect, useState } from "react";
import axiosSelf from "../lib/axiosInstance";
import PropertyCard from "../components/PropertyCard";
import PopupProperty from "../components/PopupProperty";
import UpdateProperty from '../components/UpdateProperty';
import { Properties } from "../types/interface";
import { Home } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const { user, token, initialize, refreshToken, logout } = useAuthStore();
    const [authInitialized, setAuthInitialized] = useState(false);

    const [userProperties, setUserProperties] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

    // נכס אחד
    const [oneProperty, setOneProperty] = useState<Properties | null>(null);

    const [addProperty, setAddProperty] = useState(false);

    // טעינה
    const [loading, setLoading] = useState(true);
    // שגיאה
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            initialize();
            setAuthInitialized(true);
        };
        init();
    }, [initialize, refreshToken]);

    useEffect(() => {
        if (authInitialized && (!user || !token)) router.push("/auth?mode=login");
    }, [authInitialized, user, token, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    useEffect(() => {
        if (!user?.id) return;
        const fetchUserProperties = async () => {
            const response = await axiosSelf.get(`/properties/user/${user?.id}`);
            setUserProperties(response.data);
        };
        fetchUserProperties();
    }, [user?.id]);

    // לעדכן נכס אחרי עריכה
    const onUpdateProperty = (updatedProperty: any) => {
        // לעדכן את ה־userProperties
        setUserProperties((prev) =>
            prev.map((p) => (p._id === updatedProperty._id ? updatedProperty : p))
        );
        // לעדכן גם oneProperty אם זה אותו אחד
        if (oneProperty?._id === updatedProperty._id) {
            setOneProperty(updatedProperty);
        }
    };

    // --- קבלת נכס אחד לפי ID ---
    const getOneProperty = async (_id: string, replace: boolean) => {
        try {
            const response = await axiosSelf.get(`http://localhost:5000/api/properties/${_id}`);
            openPropertyPopup(response.data, replace)
            console.log(response.data);

            // setData(response.data);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת הנתונים");
            router.replace("/profile");
        } finally {
            setLoading(false);
        }
    };
    // --- slugify url--- בשביל נכס אחד בפופאפ
    const slugify = (address: string) =>
        address
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\wא-ת0-9-]+/g, "")
            .replace(/--+/g, "-")
            .replace(/^-+|-+$/g, "");

    // --- פתיחת / סגירת פופאפ ---
    const openPropertyPopup = useCallback((property: Properties, replace = false) => {
        const slug = slugify(property.address);
        const url = `/profile?property=${slug}-${property._id}`;
        if (replace) router.replace(url);
        else router.push(url);
        setOneProperty(property);
    },
        [router]
    );
    // --- ניווט תמונות ---
    const handleNextImage = (propertyId: string) => {
        setUserProperties((prev) =>
            prev.map((p) =>
                p._id === propertyId
                    ? { ...p, main_image_index: ((p.main_image_index ?? 0) + 1) % (p.images?.length || 1) }
                    : p
            )
        );
    };
    const handlePrevImage = (propertyId: string) => {
        setUserProperties((prev) =>
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

    const closePropertyPopup = () => {
        setOneProperty(null);
        router.replace("/profile");
    };

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


    if (!authInitialized || !user) return <p>טוען פרופיל...</p>;

    const activeProperties = userProperties.filter((p) => p.active);
    const inactiveProperties = userProperties.filter((p) => !p.active);

    return (
        <div className="">
            <div className="flex items-center justify-between p-2 gap-4 bg-purple-300 ">
                <button
                    className="cursor-pointer "
                    onClick={() => router.replace("/")}>
                    <Home />

                </button>
                <h1 className="text-2xl font-bold ">פרופיל משתמש</h1>
                <div className="flex items-center gap-4 ">
                    <p>
                        <strong>שם:</strong> {user.user_name}
                    </p>
                    <p>
                        <strong>אימייל:</strong> {user.email}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className=" bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                    התנתק מהחשבון
                </button>
            </div>


            {/* טאבים */}
            <div className="p-6">
                <div>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-blue-700 mb-4"
onClick={() => setAddProperty(true)}
                    >
                        הוספת נכס
                    </button>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-6 ">
                    <button
                        className={`px-4 cursor-pointer py-2 ${activeTab === "active"
                            ? "border-b-2 border-blue-600 font-bold"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("active")}
                    >
                        נכסים פעילים
                    </button>
                    <button
                        className={`px-4 py-2 cursor-pointer ${activeTab === "inactive"
                            ? "border-b-2 border-blue-600 font-bold"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("inactive")}
                    >
                        נכסים לא פעילים
                    </button>
                </div>

                {/* תוכן טאבים */}
                <div className="mt-6">
                    {activeTab === "active" ? (
                        activeProperties.length === 0 ? (
                            <p>אין נכסים פעילים.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeProperties.map((property) => (
                                    <PropertyCard
                                        key={property._id}
                                        property={property}
                                        onClick={() => getOneProperty(property._id, false)}
                                        onNextImage={handleNextImage}
                                        onPrevImage={handlePrevImage}
                                        onUpdateProperty={onUpdateProperty}
                                    />
                                ))}
                            </div>
                        )
                    ) : inactiveProperties.length === 0 ? (
                        <p>אין נכסים לא פעילים.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inactiveProperties.map((property) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    onClick={() => getOneProperty(property._id, false)}
                                    onNextImage={handleNextImage}
                                    onPrevImage={handlePrevImage}
                                    onUpdateProperty={onUpdateProperty}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* פופאפ לנכס */}
            {oneProperty && (
                <PopupProperty
                    handleCloseModal={closePropertyPopup}
                    selectedProperty={!!oneProperty}
                    oneProperty={oneProperty}
                />
            )}
 {           /* פופאפ להוספת נכס */}
            {addProperty && (
                <UpdateProperty 
                onUpdateProperty={onUpdateProperty}
                setPopupUpdate={setAddProperty}
                property={null}
                />
            )}

        </div>
    );
}
