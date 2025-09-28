import { X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { PropertyImagesProps } from '../types/interface'

export default function PropertyImages({ closeModal, oneProperty }: PropertyImagesProps) {
    return (
        <div className="fixed inset-0 z-50 h-screen md:flex items-center justify-center">
            <div className="w-full max-w-6xl h-full bg-white  flex flex-col gap-4 overflow-y-auto">
                {/* כפתור סגירה */}
                <div className="w-full mt-2 flex  items-center">
                    <button
                        onClick={closeModal}
                        className="w-2 cursor-pointer px-2 "
                    >
                        <X />
                    </button>
                </div>

                {/* גלילה אנכית לתמונות */}
                <div className="flex-1 overflow-y-auto w-full flex flex-col items-center">
                    {oneProperty?.images?.map((url, idx) => (
                        <div
                            key={idx}
                            className="w-full flex justify-center items-center h-[80vh] md:h-[90vh] mb-2"
                        >
                            <Image
                                src={url}
                                alt={`תמונה ${idx + 1}`}
                                width={1200}
                                height={800}
                                className="object-contain max-h-full"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
