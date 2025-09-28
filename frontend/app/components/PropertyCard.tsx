import React, { useState } from 'react'
import { PropertyCardProps } from '../types/interface';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosSelf from '../lib/axiosInstance';
import { useRouter, usePathname } from 'next/navigation';
import UpdateProperty from './UpdateProperty';

export default function PropertyCard({ property, onClick, onNextImage, onPrevImage, onUpdateProperty }: PropertyCardProps) {

  const router = useRouter()
  const pathname = usePathname();

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  const [popupUpdate, setPopupUpdate] = useState(false);



  const mainImageIndex = property.main_image_index ?? 0;
  const mainImage = property.images?.[mainImageIndex];

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
     setLoading(true);
    setErrors("");
    try {
      const response = await axiosSelf.put(`/properties/${property._id}`, { active: true });
      const data = response.data;
     if(onUpdateProperty) onUpdateProperty(response.data.property);
      console.log('Property activated:', data);
    } catch (err) {
      console.error(err);

      setErrors("שגיאה בעידכון פעילות");
      setLoading(false);
    }
  }

  const handleDeleteActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
     setLoading(true);
    setErrors("");
    try {
      const response = await axiosSelf.delete(`/properties/${property._id}`);
      const data = response.data;
     if(onUpdateProperty) onUpdateProperty(response.data.property);
      console.log('Property activated:', data);
    } catch (err) {
      console.error(err);

      setErrors("שגיאה בעידכון פעילות");
      setLoading(false);
    }
  }



  return (
    <>
      <div
        className={` ${property?.active === false ? 'bg-red-300' : 'bg-white'} rounded-t-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 cursor-pointer`}
        onClick={onClick}
      >
        {mainImage && (
          <div className="w-full h-64 relative rounded-t-lg shadow-lg mb-2 overflow-hidden">
            <Image
              src={mainImage}
              alt={`תמונה ראשית של ${property.title}`}
              fill
              className="object-cover rounded-t-lg"
            />
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 h-full p-2 text-black"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                onPrevImage(property._id);
              }}
            >
              <ChevronLeft />
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 h-full p-2 text-black"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                onNextImage(property._id);
              }}
            >
              <ChevronRight />
            </button>
          </div>
        )}
        <p className="m-1 px-2">{property?.price.toLocaleString()} ₪</p>

        <div className="m-1 flex gap-2 text-gray-700 px-2">
          {property?.number_of_rooms && (
            <>
              <p className="font-bold">{property?.number_of_rooms}</p>
              <span>חדרים</span>
              <span className="text-gray-400">|</span>
            </>
          )}
          {property?.number_of_bathroom && (
            <>
              <p className="font-bold">{property?.number_of_bathroom}</p>
              <span>מקלחות</span>
              <span className="text-gray-400">|</span>
            </>
          )}
          {property?.property_size && (
            <>
              <p className="font-bold">{property?.property_size}</p>
              <span>מ"ר</span>
            </>
          )}
        </div>

        <p className="mb-1 px-2">{property?.address}</p>
        <div className='flex items-center justify-between'>

          {/* כפתור החזרה לפעילות */}
          {property?.active === false && (
            <div className="flex justify-end mb-2 px-2">
              <button
                onClick={(e) => handleActivate(e)}
                className='cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'>
                <p>החזר לפעילות</p>
              </button>
            </div>
          )}

          {/* כפתור עריכת נכס */}
          {pathname === "/profile" && (
            <div className="flex justify-end mb-2 px-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPopupUpdate(true)
                }}
                className='cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'>
                <p>עריכת נכס</p>
              </button>
            </div>
          )}

          {/* כפתור מחיקת נכס */}
          {property?.active  && (
            <div className="flex justify-end mb-2 px-2">
              <button
                onClick={(e) => handleDeleteActivate(e)}
                className='cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors'>
                <p>השבת נכס</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* פופאפ לעידכון נכס */}
      {popupUpdate && (
        <UpdateProperty
          setPopupUpdate={setPopupUpdate}
          property={property}
          // onNextImage={onNextImage}
          // onPrevImage={onPrevImage}
          onUpdateProperty={onUpdateProperty}
        />
      )}
    </>
  );
};

