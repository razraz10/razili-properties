import mongoose, { Document } from "mongoose";


export interface IProperty extends Document {
    title: string;
    description: string;
    address: string;
    number_of_rooms: string;
    number_of_bathroom: string;
    property_size: string;
    price: number;
    rent_or_sale: "rent" | "sale";
    type_of_property: "house" | "office" | "land";
    images: string[];
    main_image_index: number;
    owner: mongoose.Types.ObjectId;
    active: Boolean;
    created_at: Date;
}

const propertySchema = new mongoose.Schema<IProperty>({
    title: {type: String, required: true},
    description: {type: String, required: true},
    address: {type: String, required: true},
    number_of_rooms: {type: String},
    number_of_bathroom: {type: String},
    property_size: {type: String, required: true},
    price: {type: Number, required: true},
    rent_or_sale: {type: String, enum: ["rent", "sale"], required: true},
    type_of_property: {type: String, enum: ["house" , "office" , "land"], required: true},
    images: { type: [String], default: [] },
    main_image_index: { type: Number, default: 0 },
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    active: { type: Boolean, default: true },
    created_at: {type: Date, default: Date.now},
})

export const Property = mongoose.model<IProperty>("Property", propertySchema)