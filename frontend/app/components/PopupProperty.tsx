"use client"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { PopupPropertyProps } from "../types/interface"
import { X } from "lucide-react"
import { getThePropertyTypes } from "@/utils/getThePropertyTypes"
import PropertyImages from "./PropertyImages"

export default function PopupProperty({ handleCloseModal, oneProperty }: PopupPropertyProps) {
    if (!oneProperty) return null;

    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null)

    const openModal = (index: number) => setModalImageIndex(index)
    const closeModal = () => setModalImageIndex(null)

    // const handlePrev = () => {
    //     if (modalImageIndex !== null) {
    //         setModalImageIndex((modalImageIndex - 1 + oneProperty?.images!.length) % oneProperty?.images!.length)
    //     }
    // }

    // const handleNext = () => {
    //     if (modalImageIndex !== null) {
    //         setModalImageIndex((modalImageIndex + 1) % oneProperty?.images!.length)
    //     }
    // }


    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [])
    return (
        <div className="fixed inset-0 z-50 h-screen md:flex items-center justify-center bg-black/50 ">
            {/* Modal ראשי */}
            <div className="w-full max-w-6xl h-full bg-white p-4 flex flex-col gap-4 overflow-y-auto">
                {/* כפתור סגירה */}
                <button
                    onClick={handleCloseModal}
                    className=" top-2 right-2 w-3 cursor-pointer"
                >
                    <X size={24} />
                </button>

                {/* תמונות עליונות */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* תמונה ראשית */}
                    <div className="w-full md:w-2/3 h-64 md:h-96 relative rounded-lg overflow-hidden cursor-pointer">
                        {oneProperty?.images?.[0] && (
                            <Image
                                src={oneProperty?.images[0]}
                                alt={oneProperty?.title}
                                fill
                                className="object-cover rounded-lg"
                                onClick={() => openModal(0)}
                            />
                        )}
                    </div>

                    {/* תמונות נוספות למסכים גדולים */}
                    {oneProperty?.images && oneProperty?.images.length > 1 && (
                        <div className="hidden md:grid md:grid-cols-2 md:grid-rows-2 gap-2 w-1/3 h-96">
                            {oneProperty?.images.slice(1, 5).map((url, idx) => (
                                <div
                                    key={idx}
                                    className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => openModal(idx + 1)}
                                >
                                    <Image
                                        src={url}
                                        alt={`תמונה ${idx + 2}`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* פרטי הנכס */}
                <div className="mt-4">
                    <div className="flex gap-2 font-bold text-center">
                        <p className="mb-1 bg-orange-400 rounded-2xl w-18  ">{getThePropertyTypes(oneProperty?.type_of_property)}</p>
                        <p className="mb-1 bg-orange-400 rounded-2xl w-18   ">{getThePropertyTypes(oneProperty?.rent_or_sale)}</p>
                    </div>

                    <h2 className="text-xl font-bold mb-2">{oneProperty?.title}</h2>
                    <p className="mb-1">{oneProperty?.description}</p>
                    <p className="mb-1 font-bold">{oneProperty?.price.toLocaleString()} ₪</p>
                    <p className="mb-1">
                        {oneProperty?.number_of_rooms} חדרים | {oneProperty?.number_of_bathroom} מקלחות
                    </p>
                    <p className="mb-1">גודל: {oneProperty?.property_size} מ"ר</p>
                    <p className="mb-1">{oneProperty?.address}</p>
                </div>
            </div>

            {/* Modal פנימי לתמונה מוגדלת */}
            {modalImageIndex !== null && (
                <PropertyImages closeModal={closeModal} oneProperty={oneProperty} />
            )}


        </div>
    )
}
