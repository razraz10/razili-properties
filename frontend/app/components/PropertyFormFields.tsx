import React from 'react'
import { PropertyFormFieldsProps } from '../types/interface'

export default function PropertyFormFields({
    formData, errors, handleChange
}: PropertyFormFieldsProps) {

    const fields = [
        { name: "title", label: "כותרת", type: "text" },
        { name: "description", label: "תיאור", type: "textarea", full: true },
        { name: "address", label: "כתובת", type: "text" },
        { name: "price", label: "מחיר", type: "number" },
        {
            name: "rent_or_sale",
            label: "השכרה/מכירה",
            type: "select",
            options: [
                { value: "rent", label: "השכרה" },
                { value: "sale", label: "מכירה" },
            ],
        },
        {
            name: "type_of_property",
            label: "סוג נכס",
            type: "select",
            options: [
                { value: "house", label: "בית" },
                { value: "office", label: "משרד" },
                { value: "land", label: "קרקע" },
            ],
        },
        { name: "property_size", label: 'גודל נכס (מ״ר)', type: "text" },
        { name: "number_of_rooms", label: "מספר חדרים", type: "text" },
        { name: "number_of_bathroom", label: "מספר חדרי רחצה", type: "text" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
                <div
                    key={field.name}
                    className={field.full ? "col-span-2" : ""}
                >

                    {field.type === "textarea" ? (<>
                        <div className='font-bold'>{field.label}</div>
                        <textarea
                            name={field.name}
                            placeholder={field.label}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        /></>
                    ) : field.type === "select" ? (<>
                        <div className='font-bold'>{field.label}</div>
                        <select
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                        >
                            {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </>
                    ) : (<>
                        <div className='font-bold'>{field.label}</div>
                        <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.label}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            className={`border p-2 rounded w-full ${field.type === "number" ? "[&::-webkit-inner-spin-button]:appearance-none " : ""}`}
                        />
                    </>
                    )}
                    {errors[field.name] && (
                        <p className="text-red-500">{errors[field.name]}</p>
                    )}
                </div>
            ))}
        </div>
    )
}
