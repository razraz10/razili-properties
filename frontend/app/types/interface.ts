// המשתמש
export interface User {
  _id: string;
  name: string;
  email: string;
  properties?: Properties[];
}

// context user
export interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}


// הנכסים
export interface Properties {
    _id: string;
    title: string;
    description: string;
    address: string;
    price: number;
    number_of_rooms: string;
    number_of_bathroom: string;
    property_size: string;
    rent_or_sale: "rent" | "sale";
    type_of_property: "house" | "office" | "land";
    images: string[];
    main_image_index: number;
    owner: { id: string; user_name: string; email: string };
    active: boolean;
    created_at: string;
}

// בחירת הנכס להצגה
// export interface SelectedProperty {
//   property: Properties;
//   currentImageIndex: number;
// }

// פופאפ לנכס
export interface PopupPropertyProps {
   selectedProperty: Boolean;
   oneProperty:Properties | null;
  handleCloseModal: () => void;
}

// תצוגת כל נכס 
export interface PropertyCardProps {
  property: Properties;
  onClick: () => void;
  onNextImage: (id: string) => void;
  onPrevImage: (id: string) => void;
  onUpdateProperty?: (property: Properties) => void;
}

// בשביל תצוגת תמונות של נכס
export interface PropertyImagesProps {
  closeModal: () => void
  oneProperty: Properties
}

// עדכון נכס
export interface UpdatePropertyProps {
  setPopupUpdate: React.Dispatch<React.SetStateAction<boolean>>;
    property: Properties | null;
  //   onNextImage: (id: string) => void;
  // onPrevImage: (id: string) => void;
  onUpdateProperty?: (property: Properties) => void;
}

// טופס יצירת / עדכון נכס
export interface PropertyFormFieldsProps {
  formData: Record<string, any>;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}