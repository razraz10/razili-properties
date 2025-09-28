import { Request, Response } from "express";
import { Property } from "../models/Property";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

// Extend Express Request interface to include 'files'
declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: Express.Multer.File[]; }
      | Express.Multer.File[]
      | undefined;
      user?: any;
    }
  }
}

console.log(process.env.CLOUDINARY_URL, "lnjbij");

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});


// פונקציה שמעלה תמונה ל-Cloudinary
const uploadToCloudinary = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "properties" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// יצירת נכס חדש
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { title, description, address, price, rent_or_sale, type_of_property, number_of_rooms, number_of_bathroom, property_size, main_image_index } = req.body;
    const files = req.files as Express.Multer.File[] || [];

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const errorsArray: string[] = [];

    if (!title || title.trim().length < 3 || title.trim().length > 100)
      errorsArray.push("Title is required (min 3 chars and max 100)");
    if (!description || description.trim().length < 10 || description.trim().length > 255)
      errorsArray.push("Description is required (min 10 chars and max 255)");
    if (!address || address.trim().length < 5 || address.trim().length > 50)
      errorsArray.push("Address is required (min 5 chars and max 50)");
    if (!price || isNaN(price) || price <= 0)
      errorsArray.push("Price must be a positive number");
    if (!["rent", "sale"].includes(rent_or_sale))
      errorsArray.push("rent_or_sale must be either 'rent' or 'sale'");
    if (!["house", "office", "land"].includes(type_of_property))
      errorsArray.push("type_of_property must be 'house', 'office', or 'land'");
    if (!property_size || property_size.trim().length <= 0) errorsArray.push("You need to wright size");
    if (files.length > 20) errorsArray.push("Max 20 images allowed");
    if (files.length <= 0) errorsArray.push("Min 1 image");

    if (errorsArray.length > 0) return res.status(400).json({ errorsArray });

    // העלאת תמונות ל-Cloudinary
    const imageUrls: string[] = [];
    for (const file of files) {
      const uploadResponse: any = await uploadToCloudinary(file.buffer);
      imageUrls.push(uploadResponse.secure_url);
    }

    const index = main_image_index !== undefined ? Number(main_image_index) : 0;
    const validIndex = index >= 0 && index < imageUrls.length ? index : 0;


    const property = new Property({
      title,
      description,
      address,
      price,
      rent_or_sale,
      type_of_property,
      number_of_rooms,
      number_of_bathroom,
      property_size,
      images: imageUrls,
      main_image_index: validIndex,
      owner: req.user.id,
    });

    await property.save();
    res.status(201).json({ message: "Property created", property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: (err as any).message || err });
  }
};



// להביא את כל הנכסים
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find({ active: true },
      "main_image_index images number_of_rooms number_of_bathroom property_size address price")
      .populate("owner", "user_name email")
    res.json(properties)

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}


// קבלת נכס ספציפי
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.split("-").pop();
    const property = await Property.findById(id)
      .populate("owner", "user_name email");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};


// userId כל הנכסים של משתמש מסוים לפי 
export const getPropertiesByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    const properties = await Property.find({ owner: userId })
      .populate("owner", "user_name email")
    res.json(properties)

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}


// עידכון נכס
export const updateProperty = async (req: Request, res: Response) => {
  try {
    // if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    let {
      title,
      description,
      address,
      price,
      rent_or_sale,
      type_of_property,
      number_of_rooms,
      number_of_bathroom,
      property_size,
      main_image_index,
      removeImages,
      active,
    } = req.body;

    const files = req.files as Express.Multer.File[] || [];
    const errorsArray: string[] = [];

    // בדיקות שדות
    if (title !== undefined && (title.trim().length < 3 || title.trim().length > 100))
      errorsArray.push("Title is required (min 3 chars and max 100)");
    if (description !== undefined && (description.trim().length < 10 || description.trim().length > 255))
      errorsArray.push("Description is required (min 10 chars and max 255)");
    if (address !== undefined && (address.trim().length < 5 || address.trim().length > 50))
      errorsArray.push("Address is required (min 5 chars and max 50)");
    if (price !== undefined && (isNaN(price) || price <= 0))
      errorsArray.push("Price must be a positive number");
    if (rent_or_sale !== undefined && !["rent", "sale"].includes(rent_or_sale))
      errorsArray.push("rent_or_sale must be either 'rent' or 'sale'");
    if (type_of_property !== undefined && !["house", "office", "land"].includes(type_of_property))
      errorsArray.push("type_of_property must be 'house', 'office', or 'land'");
    if (property_size !== undefined && property_size.trim().length <= 0) errorsArray.push("You need to write size");

    // הסרת תמונות קיימות אם נשלחו
    if (removeImages) {
      try {
        removeImages = JSON.parse(removeImages);
      } catch (e) {
        removeImages = [];
      }
    }
    if (Array.isArray(removeImages)) {
      property.images = property.images.filter(img => !removeImages.includes(img));
    }

    // בדיקה שמספר התמונות לא עובר 20
    if (property.images.length + files.length > 20) errorsArray.push("Max 20 images allowed");
    if (property.images.length + files.length <= 0) errorsArray.push("Min 1 image");

    if (errorsArray.length > 0) return res.status(400).json({ errorsArray });

    // העלאת תמונות חדשות בלבד
    if (files.length > 0) {
      for (const file of files) {
        const uploadResponse: any = await uploadToCloudinary(file.buffer);
        if (!property.images.includes(uploadResponse.secure_url)) {
          property.images.push(uploadResponse.secure_url);
        }
      }
    }

    // עדכון שדות טקסט
    if (title) property.title = title;
    if (description) property.description = description;
    if (address) property.address = address;
    if (price) property.price = price;
    if (rent_or_sale) property.rent_or_sale = rent_or_sale;
    if (type_of_property) property.type_of_property = type_of_property;
    if (number_of_rooms) property.number_of_rooms = number_of_rooms;
    if (number_of_bathroom) property.number_of_bathroom = number_of_bathroom;
    if (property_size) property.property_size = property_size;
    if (active) property.active = active;

    // עדכון תמונה ראשית
    if (main_image_index !== undefined) {
      const index = Number(main_image_index);
      if (!isNaN(index) && index >= 0 && index < property.images.length) {
        property.main_image_index = index;
      }
    }

    await property.save();
    res.json({ message: "Property updated", property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: (err as any).message || err });
  }
};





// מחיקת נכס והעברה למצב לא פעיל
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // בדיקת הרשאה – בעל הנכס או admin
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    property.active = !property.active
    await property.save()

    res.json({
      message: property.active ? "Property re-activated" : "Property deactivated",
      property,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}
