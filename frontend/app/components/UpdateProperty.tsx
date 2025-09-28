import React, { useState } from "react";
import type { UpdatePropertyProps } from "../types/interface";
import axiosSelf from "../lib/axiosInstance";
import { UploadCloudIcon, X } from "lucide-react";
import Image from "next/image";
import PropertyFormFields from "./PropertyFormFields";
import { useAuthStore } from "../store/authStore";

export default function UpdateProperty({
    setPopupUpdate,
    property,
    onUpdateProperty,
}: UpdatePropertyProps) {

    const { user } = useAuthStore()

    const [formData, setFormData] = useState({
        title: property?.title || "",
        description: property?.description || "",
        address: property?.address || "",
        price: property?.price || 0,
        rent_or_sale: property?.rent_or_sale || "rent",
        type_of_property: property?.type_of_property || "house",
        property_size: property?.property_size || "",
        number_of_rooms: property?.number_of_rooms || "",
        number_of_bathroom: property?.number_of_bathroom || "",
        main_image_index: property?.main_image_index || 0,
    });

    const [existingImages, setExistingImages] = useState<string[]>(property?.images || []);
    const [removeImages, setRemoveImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // שינוי שדות טקסט
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // בחירת תמונות חדשות
    const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages([...newImages, ...Array.from(e.target.files)]);
        }
    };

    // הסרת תמונה קיימת
    const handleRemoveExisting = (url: string) => {
        setExistingImages(existingImages.filter((img) => img !== url));
        setRemoveImages([...removeImages, url]);
    };

    // הסרת תמונה חדשה לפני שליחה
    const handleRemoveNew = (index: number) => {
        const updated = [...newImages];
        updated.splice(index, 1);
        setNewImages(updated);
    };

    // הפיכת תמונה לראשית
    const handleSetMain = (index: number, isNew: boolean = false) => {
        if (isNew) {
            // לא ניתן להגדיר כראשית לפני שליחה
            alert("תשמור קודם ואז תוכל להפוך את התמונה החדשה לראשית");
            return;
        }
        setFormData({ ...formData, main_image_index: index });
    };

    const handelAddingNewProperty = async () => {
        setLoading(true);
        setErrors({});

        try {
            const data = new FormData();
             Object.entries(formData).forEach(([key, value]) =>
                data.append(key, value as any)
            );

               // תמונות חדשות
            newImages.forEach((file) => data.append("images", file));

            data.append("active", "true");

            const response = await axiosSelf.post(`/properties/${user?.id}`, data,{
                headers: { "Content-Type": "multipart/form-data" },
            })
            console.log("Property added:", response.data);
            if (onUpdateProperty) onUpdateProperty(response.data.property);

            setFormData({
                title: "",
                description: "",
                address: "",
                price: 0,
                rent_or_sale: "rent",
                type_of_property: "house",
                property_size: "",
                number_of_rooms: "",
                number_of_bathroom: "",
                main_image_index: 0,
            });
            setExistingImages([]);
            setRemoveImages([]);
            setNewImages([]);
            setPopupUpdate(false);

        } catch (err: any) {
            if (err.response?.data?.errorsArray) {
                const newErrors: Record<string, string> = {};
                err.response.data.errorsArray.forEach((msg: string) => {
                    if (msg.toLowerCase().includes("title")) newErrors.title = msg;
                    else if (msg.toLowerCase().includes("description")) newErrors.description = msg;
                    else if (msg.toLowerCase().includes("address")) newErrors.address = msg;     
                    else if (msg.toLowerCase().includes("size")) newErrors.property_size = msg;      
                    else if (msg.toLowerCase().includes("price")) newErrors.price = msg;
                    else if (msg.toLowerCase().includes("image")) newErrors.images = msg;                       
                    else newErrors.general = msg;
                });
                setErrors(newErrors);
            } else {
                setErrors({ general: "שגיאה בשרת" });
            }
        } finally {
            setLoading(false);
        }
    }

    // שליחת העדכון
    const handleUpdate = async () => {
        setLoading(true);
        setErrors({});
        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) =>
                data.append(key, value as any)
            );

            // תמונות להסרה
            if (removeImages.length > 0) {
                data.append("removeImages", JSON.stringify(removeImages));
            }

            // תמונות חדשות
            newImages.forEach((file) => data.append("images", file));

            data.append("active", "true");

            const response = await axiosSelf.put(
                `/properties/${property?._id}`,
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (onUpdateProperty) onUpdateProperty(response.data.property);
            console.log("Property updated:", response.data);
            setPopupUpdate(false);
        } catch (err: any) {
            if (err.response?.data?.errorsArray) {
                const newErrors: Record<string, string> = {};
                err.response.data.errorsArray.forEach((msg: string) => {
                    if (msg.toLowerCase().includes("title")) newErrors.title = msg;
                    else if (msg.toLowerCase().includes("description")) newErrors.description = msg;                       
                    else if (msg.toLowerCase().includes("address")) newErrors.address = msg;                   
                    else if (msg.toLowerCase().includes("property_size")) newErrors.property_size = msg;
                    else if (msg.toLowerCase().includes("price")) newErrors.price = msg;
                    else if (msg.toLowerCase().includes("image")) newErrors.images = msg;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 w-full max-w-3xl rounded-lg overflow-y-auto max-h-[90vh] shadow-lg">
                <div className="flex justify-between  items-center mb-4">
                    <h2 className="text-xl font-bold ">{property === null ? "הוספת נכס" : "עידכון נכס"}</h2>
                    <button
                        onClick={() => setPopupUpdate(false)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                        <X />
                    </button>
                </div>

                {/* שדות טקסט */}
                <PropertyFormFields
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                />


                {/* תמונות קיימות */}
                {existingImages.length > 0 && (
                    <>
                        <h3 className="mt-6 font-semibold">תמונות קיימות</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            {existingImages.map((img, idx) => (
                                <div key={idx} className="relative border rounded overflow-hidden">
                                    <Image
                                        src={img}
                                        alt={`תמונה ${idx + 1}`}
                                        width={200}
                                        height={150}
                                        className="object-cover w-full h-32"
                                    />
                                    {formData.main_image_index === idx && (
                                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            ראשית
                                        </span>
                                    )}
                                    <div className="absolute bottom-1 left-1 flex gap-2">
                                        <button
                                            onClick={() => handleSetMain(idx)}
                                            className="bg-blue-500 cursor-pointer text-white text-xs px-2 py-1 rounded"
                                        >
                                            הפוך לראשית
                                        </button>
                                        <button
                                            onClick={() => handleRemoveExisting(img)}
                                            className="bg-red-500 cursor-pointer text-white text-xs px-2 py-1 rounded"
                                        >
                                            מחק
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}


                {/* תמונות חדשות */}
                <h3 className="mt-6 font-semibold">תמונות חדשות</h3>
                <label className="block mt-2 cursor-pointer text-blue-600 hover:underline w-4">
                    <UploadCloudIcon />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewImages}
                        className="hidden"
                    />
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {newImages.map((file, idx) => (
                        <div key={idx} className="relative border rounded overflow-hidden">
                            <Image
                                src={URL.createObjectURL(file)}
                                alt={`תמונה חדשה ${idx + 1}`}
                                width={200}
                                height={150}
                                className="object-cover w-full h-32"
                            />
                            <button
                                onClick={() => handleRemoveNew(idx)}
                                className="absolute cursor-pointer bottom-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                            >
                                מחק
                            </button>
                        </div>
                    ))}
                </div>

                {errors.images && <p className="text-red-500 mt-2">{errors.images}</p>}
                {errors.general && <p className="text-red-500 mt-2">{errors.general}</p>}

                <div className="flex justify-end gap-2 mt-6">

                    <button
                        onClick={() => {
                            property === null ? handelAddingNewProperty() :
                                handleUpdate()
                        }}
                        className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ?
                            "מעדכן..." :
                            property === null ? "הוספת נכס" : "עידכון נכס"}
                    </button>
                </div>
            </div>
        </div>
    );
}
