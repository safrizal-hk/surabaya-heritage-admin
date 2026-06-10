"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- TYPES & INTERFACES ---

export interface Category {
  id: number;
  name: string;
  icon: string; // Lucide icon name, e.g., "Building", "Church", "Compass", "Trees", "BookOpen", "Flag"
  created_at: string;
}

export interface Place {
  id: number;
  category_id: number;
  google_place_id?: string;
  name: string;
  slug: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  opening_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  phone?: string;
  website?: string;
  avg_rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlacePhoto {
  id: number;
  place_id: number;
  photo_url: string;
  caption: string;
  is_primary: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  place_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  avatar_url: string;
  created_at: string;
}

export interface Bookmark {
  id: number;
  place_id: number;
  user_id: number;
  created_at: string;
}

interface DBContextType {
  // Data lists
  categories: Category[];
  places: Place[];
  placePhotos: PlacePhoto[];
  reviews: Review[];
  users: User[];
  bookmarks: Bookmark[];
  
  // Auth state
  currentUser: User | null;
  isAuthenticated: boolean;

  // Auth operations
  login: (email: string, password_hash: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (name: string, email: string, password?: string, avatarUrl?: string) => { success: boolean; error?: string };

  // Category CRUD
  createCategory: (name: string, icon: string) => Category;
  updateCategory: (id: number, name: string, icon: string) => Category | null;
  deleteCategory: (id: number) => { success: boolean; error?: string };

  // Place CRUD
  createPlace: (placeData: Omit<Place, "id" | "avg_rating" | "review_count" | "created_at" | "updated_at">) => Place;
  updatePlace: (id: number, placeData: Partial<Place>) => Place | null;
  deletePlace: (id: number) => boolean;

  // Photo operations
  addPhoto: (placeId: number, photoUrl: string, caption: string, isPrimary: boolean) => PlacePhoto;
  deletePhoto: (photoId: number) => boolean;
  setPrimaryPhoto: (placeId: number, photoId: number) => boolean;

  // Review operations
  createReview: (placeId: number, userId: number, rating: number, comment: string) => Review;
  updateReview: (reviewId: number, rating: number, comment: string) => Review | null;
  deleteReview: (reviewId: number) => boolean;

  // User CRUD
  createUser: (userData: Omit<User, "id" | "created_at">) => { success: boolean; user?: User; error?: string };
  updateUser: (id: number, userData: Partial<User>) => { success: boolean; user?: User; error?: string };
  deleteUser: (id: number) => { success: boolean; error?: string };
}

// --- INITIAL MOCK DATA ---

const initialCategories: Category[] = [
  { id: 1, name: "Historical Buildings", icon: "Building", created_at: "2026-01-10T00:00:00Z" },
  { id: 2, name: "Monuments", icon: "Flag", created_at: "2026-01-11T00:00:00Z" },
  { id: 3, name: "Religious Sites", icon: "Compass", created_at: "2026-01-12T00:00:00Z" },
  { id: 4, name: "Museums", icon: "BookOpen", created_at: "2026-01-13T00:00:00Z" },
  { id: 5, name: "Cultural Parks", icon: "Trees", created_at: "2026-01-14T00:00:00Z" },
];

const initialPlaces: Place[] = [
  {
    id: 1,
    category_id: 1,
    google_place_id: "ChIJ12345678",
    name: "Hotel Majapahit",
    slug: "hotel-majapahit",
    address: "Jl. Tunjungan No.65, Genteng, Kec. Genteng, Surabaya, Jawa Timur 60275",
    lat: -7.2572,
    lng: 112.7388,
    description: "Hotel Majapahit is a historic luxury hotel in Surabaya, East Java, Indonesia. Founded in 1910 as the Hotel Oranje by the famous Sarkies brothers, it is famous for the 'Hotel Yamato Incident' where Indonesian nationalists ripped the blue stripe from the Dutch colonial flag flying on the hotel roof, changing it into the red-and-white Indonesian flag.",
    opening_hours: {
      monday: "Open 24 Hours",
      tuesday: "Open 24 Hours",
      wednesday: "Open 24 Hours",
      thursday: "Open 24 Hours",
      friday: "Open 24 Hours",
      saturday: "Open 24 Hours",
      sunday: "Open 24 Hours",
    },
    phone: "+62 31 5454333",
    website: "https://www.hotel-majapahit.com",
    avg_rating: 4.7,
    review_count: 3,
    is_active: true,
    created_at: "2026-02-10T09:00:00Z",
    updated_at: "2026-02-10T09:00:00Z",
  },
  {
    id: 2,
    category_id: 2,
    google_place_id: "ChIJ88888888",
    name: "Tugu Pahlawan (Heroes Monument)",
    slug: "tugu-pahlawan",
    address: "Jl. Pahlawan, Alun-alun Contong, Kec. Bubutan, Surabaya, Jawa Timur 60174",
    lat: -7.2458,
    lng: 112.7378,
    description: "The Heroes Monument is a monument in Surabaya, Indonesia. It is the main symbol of the city, dedicated to the people who died during the Battle of Surabaya on November 10, 1945. The monument is 41.15 meters tall and is shaped like an upside-down nail. It houses the Museum Sepuluh Nopember underneath.",
    opening_hours: {
      monday: "08:00 - 16:00",
      tuesday: "08:00 - 16:00",
      wednesday: "08:00 - 16:00",
      thursday: "08:00 - 16:00",
      friday: "08:00 - 16:00",
      saturday: "07:00 - 15:00",
      sunday: "07:00 - 15:00",
    },
    phone: "+62 31 3571100",
    website: "https://www.surabaya.go.id/tugu-pahlawan",
    avg_rating: 4.7,
    review_count: 3,
    is_active: true,
    created_at: "2026-02-12T10:00:00Z",
    updated_at: "2026-02-12T10:00:00Z",
  },
  {
    id: 3,
    category_id: 4,
    google_place_id: "ChIJ99999999",
    name: "House of Sampoerna",
    slug: "house-of-sampoerna",
    address: "Taman Sampoerna No.6, Krembangan Utara, Kec. Pabean Cantian, Surabaya, Jawa Timur 60163",
    lat: -7.2307,
    lng: 112.7342,
    description: "House of Sampoerna is a tobacco museum and headquarters of Sampoerna. Located in Surabaya, the main building's Dutch colonial-style architecture was built in 1862 and is now a preserved heritage site. It features a museum, an art gallery, a cafe, and observation decks where visitors can watch workers hand-roll clove cigarettes.",
    opening_hours: {
      monday: "09:00 - 18:00",
      tuesday: "09:00 - 18:00",
      wednesday: "09:00 - 18:00",
      thursday: "09:00 - 18:00",
      friday: "09:00 - 18:00",
      saturday: "09:00 - 18:00",
      sunday: "09:00 - 18:00",
    },
    phone: "+62 31 3531426",
    website: "https://www.houseofsampoerna.com",
    avg_rating: 4.7,
    review_count: 3,
    is_active: true,
    created_at: "2026-02-15T11:00:00Z",
    updated_at: "2026-02-15T11:00:00Z",
  },
  {
    id: 4,
    category_id: 3,
    google_place_id: "ChIJ77777777",
    name: "Masjid Nasional Al-Akbar",
    slug: "masjid-nasional-al-akbar",
    address: "Jl. Masjid Al-Akbar Timur No.1, Pagesangan, Kec. Jambangan, Surabaya, Jawa Timur 60274",
    lat: -7.3372,
    lng: 112.7153,
    description: "Al-Akbar National Mosque is a national mosque located in Surabaya, East Java. It is the second-largest mosque in Indonesia after Istiqlal Mosque in Jakarta. The mosque features a distinctive blue-green dome and a 99-meter high minaret equipped with a viewing elevator for visitors.",
    opening_hours: {
      monday: "Open 24 Hours",
      tuesday: "Open 24 Hours",
      wednesday: "Open 24 Hours",
      thursday: "Open 24 Hours",
      friday: "Open 24 Hours",
      saturday: "Open 24 Hours",
      sunday: "Open 24 Hours",
    },
    phone: "+62 31 8289666",
    website: "https://www.masjidalakbar.or.id",
    avg_rating: 5.0,
    review_count: 3,
    is_active: true,
    created_at: "2026-02-18T12:00:00Z",
    updated_at: "2026-02-18T12:00:00Z",
  },
  {
    id: 5,
    category_id: 2,
    google_place_id: "ChIJ55555555",
    name: "Jembatan Merah (Red Bridge)",
    slug: "jembatan-merah",
    address: "Jl. Kembang Jepun, Krembangan Utara, Kec. Pabean Cantian, Surabaya, Jawa Timur 60162",
    lat: -7.2359,
    lng: 112.7369,
    description: "The Red Bridge is a historical bridge in Surabaya crossing the Kalimas river. It became a prominent battle site during the Battle of Surabaya in November 1945, when Indonesian freedom fighters fought against Allied forces. The area surrounding the bridge retains many colonial Dutch buildings.",
    opening_hours: {
      monday: "Open 24 Hours",
      tuesday: "Open 24 Hours",
      wednesday: "Open 24 Hours",
      thursday: "Open 24 Hours",
      friday: "Open 24 Hours",
      saturday: "Open 24 Hours",
      sunday: "Open 24 Hours",
    },
    phone: "-",
    website: "-",
    avg_rating: 4.3,
    review_count: 3,
    is_active: true,
    created_at: "2026-02-20T14:00:00Z",
    updated_at: "2026-02-20T14:00:00Z",
  },
];

const initialPlacePhotos: PlacePhoto[] = [
  { id: 1, place_id: 1, photo_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80", caption: "Hotel Majapahit exterior facade", is_primary: true, created_at: "2026-02-10T09:05:00Z" },
  { id: 2, place_id: 2, photo_url: "https://images.unsplash.com/photo-1596422846543-75c6fc18a52b?w=800&auto=format&fit=crop&q=80", caption: "The tall Heroes Monument", is_primary: true, created_at: "2026-02-12T10:05:00Z" },
  { id: 3, place_id: 3, photo_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80", caption: "House of Sampoerna museum entrance", is_primary: true, created_at: "2026-02-15T11:05:00Z" },
  { id: 4, place_id: 4, photo_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80", caption: "Beautiful blue domes of Al-Akbar Mosque", is_primary: true, created_at: "2026-02-18T12:05:00Z" },
  { id: 5, place_id: 5, photo_url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80", caption: "Surabaya historic Red Bridge crossing the river", is_primary: true, created_at: "2026-02-20T14:05:00Z" },
];

const initialUsers: User[] = [
  { id: 1, name: "Safrizal HK", email: "admin@surabayaheritage.com", password_hash: "admin123", role: "admin", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", created_at: "2026-01-01T00:00:00Z" },
  { id: 2, name: "Ahmad Fauzi", email: "fauzi@gmail.com", password_hash: "fauzi123", role: "user", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", created_at: "2026-01-15T00:00:00Z" },
  { id: 3, name: "Dewi Lestari", email: "dewi@gmail.com", password_hash: "dewi123", role: "user", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", created_at: "2026-01-20T00:00:00Z" },
  { id: 4, name: "Budi Santoso", email: "budi@gmail.com", password_hash: "budi123", role: "user", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", created_at: "2026-02-01T00:00:00Z" },
  { id: 5, name: "Rina Wijaya", email: "rina@gmail.com", password_hash: "rina123", role: "admin", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80", created_at: "2026-02-05T00:00:00Z" },
];

const initialReviews: Review[] = [
  // Hotel Majapahit Reviews
  { id: 1, place_id: 1, user_id: 2, rating: 5, comment: "Absolutely breathtaking! The historic vibes are preserved so well. The staff is polite, and the courtyard is beautiful.", created_at: "2026-03-01T09:00:00Z", updated_at: "2026-03-01T09:00:00Z" },
  { id: 2, place_id: 1, user_id: 3, rating: 5, comment: "An iconic historical place in Surabaya. Ripping of the flag history makes it so special. Highly recommended to visit!", created_at: "2026-03-02T10:00:00Z", updated_at: "2026-03-02T10:00:00Z" },
  { id: 3, place_id: 1, user_id: 4, rating: 4, comment: "Beautiful place to stay. Very clean, though the price is premium, the history is worth every penny.", created_at: "2026-03-03T11:00:00Z", updated_at: "2026-03-03T11:00:00Z" },
  
  // Tugu Pahlawan Reviews
  { id: 4, place_id: 2, user_id: 2, rating: 5, comment: "The central symbol of Surabaya. The museum under the monument is very clean and offers an immersive history lesson.", created_at: "2026-03-05T09:00:00Z", updated_at: "2026-03-05T09:00:00Z" },
  { id: 5, place_id: 2, user_id: 3, rating: 4, comment: "Very spacious park. Nice place to bring kids to learn about the Battle of Surabaya. Best visited in the morning.", created_at: "2026-03-06T10:00:00Z", updated_at: "2026-03-06T10:00:00Z" },
  { id: 6, place_id: 2, user_id: 5, rating: 5, comment: "A majestic monument. An absolute must-visit for anyone traveling to Surabaya to understand why it's called the City of Heroes.", created_at: "2026-03-07T11:00:00Z", updated_at: "2026-03-07T11:00:00Z" },
  
  // House of Sampoerna Reviews
  { id: 7, place_id: 3, user_id: 2, rating: 4, comment: "Nice museum! Learning about the history of clove cigarettes was very interesting. The building itself is beautiful colonial architecture.", created_at: "2026-03-10T09:00:00Z", updated_at: "2026-03-10T09:00:00Z" },
  { id: 8, place_id: 3, user_id: 4, rating: 5, comment: "Very unique tour. You can see the manual cigarette rolling process which is incredibly fast. Clean toilets and nice cafe.", created_at: "2026-03-11T10:00:00Z", updated_at: "2026-03-11T10:00:00Z" },
  { id: 9, place_id: 3, user_id: 5, rating: 5, comment: "One of the best museums in Surabaya. Free entry and very well-managed. Great souvenirs too.", created_at: "2026-03-12T11:00:00Z", updated_at: "2026-03-12T11:00:00Z" },
  
  // Masjid Nasional Al-Akbar Reviews
  { id: 10, place_id: 4, user_id: 3, rating: 5, comment: "Extremely grand and peaceful mosque. The blue dome is very unique. Very spacious parking area.", created_at: "2026-03-15T09:00:00Z", updated_at: "2026-03-15T09:00:00Z" },
  { id: 11, place_id: 4, user_id: 4, rating: 5, comment: "Beautiful architecture. Highly recommend going up the minaret to see the Surabaya city view from above.", created_at: "2026-03-16T10:00:00Z", updated_at: "2026-03-16T10:00:00Z" },
  { id: 12, place_id: 4, user_id: 2, rating: 5, comment: "Stunning mosque, one of the largest in Southeast Asia. Very clean facilities.", created_at: "2026-03-17T11:00:00Z", updated_at: "2026-03-17T11:00:00Z" },
  
  // Jembatan Merah Reviews
  { id: 13, place_id: 5, user_id: 3, rating: 4, comment: "Historic bridge. Lots of heritage buildings around, though traffic can be very congested during work hours.", created_at: "2026-03-20T09:00:00Z", updated_at: "2026-03-20T09:00:00Z" },
  { id: 14, place_id: 5, user_id: 4, rating: 4, comment: "Important historical landmark. Good spot for vintage photography in old town Surabaya.", created_at: "2026-03-21T10:00:00Z", updated_at: "2026-03-21T10:00:00Z" },
  { id: 15, place_id: 5, user_id: 2, rating: 5, comment: "A simple bridge but carries a heavy history. Love walking around the Old Town (Kota Tua) area near here.", created_at: "2026-03-22T11:00:00Z", updated_at: "2026-03-22T11:00:00Z" },
];

const initialBookmarks: Bookmark[] = [
  { id: 1, place_id: 1, user_id: 2, created_at: "2026-03-01T09:05:00Z" },
  { id: 2, place_id: 2, user_id: 2, created_at: "2026-03-05T09:05:00Z" },
  { id: 3, place_id: 1, user_id: 3, created_at: "2026-03-02T10:05:00Z" },
  { id: 4, place_id: 4, user_id: 4, created_at: "2026-03-16T10:05:00Z" },
];

// --- CONTEXT PROVIDER ---

const DBContext = createContext<DBContextType | undefined>(undefined);

export function DBProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placePhotos, setPlacePhotos] = useState<PlacePhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const localCategories = localStorage.getItem("sh_categories");
    const localPlaces = localStorage.getItem("sh_places");
    const localPhotos = localStorage.getItem("sh_photos");
    const localReviews = localStorage.getItem("sh_reviews");
    const localUsers = localStorage.getItem("sh_users");
    const localBookmarks = localStorage.getItem("sh_bookmarks");
    const localAuth = localStorage.getItem("sh_current_user");

    if (localCategories) setCategories(JSON.parse(localCategories));
    else {
      setCategories(initialCategories);
      localStorage.setItem("sh_categories", JSON.stringify(initialCategories));
    }

    if (localPlaces) setPlaces(JSON.parse(localPlaces));
    else {
      setPlaces(initialPlaces);
      localStorage.setItem("sh_places", JSON.stringify(initialPlaces));
    }

    if (localPhotos) setPlacePhotos(JSON.parse(localPhotos));
    else {
      setPlacePhotos(initialPlacePhotos);
      localStorage.setItem("sh_photos", JSON.stringify(initialPlacePhotos));
    }

    if (localReviews) setReviews(JSON.parse(localReviews));
    else {
      setReviews(initialReviews);
      localStorage.setItem("sh_reviews", JSON.stringify(initialReviews));
    }

    if (localUsers) setUsers(JSON.parse(localUsers));
    else {
      setUsers(initialUsers);
      localStorage.setItem("sh_users", JSON.stringify(initialUsers));
    }

    if (localBookmarks) setBookmarks(JSON.parse(localBookmarks));
    else {
      setBookmarks(initialBookmarks);
      localStorage.setItem("sh_bookmarks", JSON.stringify(initialBookmarks));
    }

    if (localAuth) {
      setCurrentUser(JSON.parse(localAuth));
      setIsAuthenticated(true);
    }
    
    setIsInitialized(true);
  }, []);

  // Helper to persist data to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- AUTH OPERATIONS ---

  const login = (email: string, password_hash: string) => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password_hash
    );
    if (!foundUser) {
      return { success: false, error: "Invalid email or password" };
    }
    if (foundUser.role !== "admin") {
      return { success: false, error: "Access Denied: Only administrators can log in here." };
    }
    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    saveToStorage("sh_current_user", foundUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("sh_current_user");
  };

  const updateProfile = (name: string, email: string, password?: string, avatarUrl?: string) => {
    if (!currentUser) return { success: false, error: "No user authenticated" };
    
    // Check email uniqueness if email is changing
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== currentUser.id);
      if (emailExists) {
        return { success: false, error: "Email already taken" };
      }
    }

    const updatedUser: User = {
      ...currentUser,
      name,
      email,
      password_hash: password || currentUser.password_hash,
      avatar_url: avatarUrl || currentUser.avatar_url,
    };

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveToStorage("sh_users", updatedUsers);

    setCurrentUser(updatedUser);
    saveToStorage("sh_current_user", updatedUser);
    return { success: true };
  };

  // --- CATEGORY OPERATIONS ---

  const createCategory = (name: string, icon: string) => {
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const newCategory: Category = {
      id: newId,
      name,
      icon,
      created_at: new Date().toISOString(),
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveToStorage("sh_categories", updated);
    return newCategory;
  };

  const updateCategory = (id: number, name: string, icon: string) => {
    const categoryIndex = categories.findIndex((c) => c.id === id);
    if (categoryIndex === -1) return null;

    const updatedCategory: Category = {
      ...categories[categoryIndex],
      name,
      icon,
    };
    const updated = categories.map((c) => (c.id === id ? updatedCategory : c));
    setCategories(updated);
    saveToStorage("sh_categories", updated);
    return updatedCategory;
  };

  const deleteCategory = (id: number) => {
    // Check if category is used by any place
    const inUse = places.some((p) => p.category_id === id);
    if (inUse) {
      return { success: false, error: "Cannot delete category because it is linked to existing heritage places." };
    }
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    saveToStorage("sh_categories", updated);
    return { success: true };
  };

  // --- PLACE OPERATIONS ---

  const createPlace = (placeData: Omit<Place, "id" | "avg_rating" | "review_count" | "created_at" | "updated_at">) => {
    const newId = places.length > 0 ? Math.max(...places.map((p) => p.id)) + 1 : 1;
    const newPlace: Place = {
      ...placeData,
      id: newId,
      avg_rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...places, newPlace];
    setPlaces(updated);
    saveToStorage("sh_places", updated);
    return newPlace;
  };

  const updatePlace = (id: number, placeData: Partial<Place>) => {
    const placeIndex = places.findIndex((p) => p.id === id);
    if (placeIndex === -1) return null;

    const updatedPlace: Place = {
      ...places[placeIndex],
      ...placeData,
      updated_at: new Date().toISOString(),
    };
    const updated = places.map((p) => (p.id === id ? updatedPlace : p));
    setPlaces(updated);
    saveToStorage("sh_places", updated);
    return updatedPlace;
  };

  const deletePlace = (id: number) => {
    const exists = places.some((p) => p.id === id);
    if (!exists) return false;

    // Remove place
    const updatedPlaces = places.filter((p) => p.id !== id);
    setPlaces(updatedPlaces);
    saveToStorage("sh_places", updatedPlaces);

    // Cascade delete photos
    const updatedPhotos = placePhotos.filter((photo) => photo.place_id !== id);
    setPlacePhotos(updatedPhotos);
    saveToStorage("sh_photos", updatedPhotos);

    // Cascade delete reviews
    const updatedReviews = reviews.filter((review) => review.place_id !== id);
    setReviews(updatedReviews);
    saveToStorage("sh_reviews", updatedReviews);

    // Cascade delete bookmarks
    const updatedBookmarks = bookmarks.filter((b) => b.place_id !== id);
    setBookmarks(updatedBookmarks);
    saveToStorage("sh_bookmarks", updatedBookmarks);

    return true;
  };

  // --- PHOTO OPERATIONS ---

  const addPhoto = (placeId: number, photoUrl: string, caption: string, isPrimary: boolean) => {
    const newId = placePhotos.length > 0 ? Math.max(...placePhotos.map((ph) => ph.id)) + 1 : 1;
    
    // If setting to primary, unset previous primary photo for this place
    let updatedPhotos = [...placePhotos];
    if (isPrimary) {
      updatedPhotos = placePhotos.map((photo) => 
        photo.place_id === placeId ? { ...photo, is_primary: false } : photo
      );
    }

    const newPhoto: PlacePhoto = {
      id: newId,
      place_id: placeId,
      photo_url: photoUrl,
      caption,
      is_primary: isPrimary,
      created_at: new Date().toISOString(),
    };

    updatedPhotos.push(newPhoto);
    setPlacePhotos(updatedPhotos);
    saveToStorage("sh_photos", updatedPhotos);
    return newPhoto;
  };

  const deletePhoto = (photoId: number) => {
    const photoToDelete = placePhotos.find((photo) => photo.id === photoId);
    if (!photoToDelete) return false;

    const updatedPhotos = placePhotos.filter((photo) => photo.id !== photoId);
    
    // If the deleted photo was primary, set another photo of the same place as primary if possible
    if (photoToDelete.is_primary) {
      const remainingPlacePhotos = updatedPhotos.filter((photo) => photo.place_id === photoToDelete.place_id);
      if (remainingPlacePhotos.length > 0) {
        remainingPlacePhotos[0].is_primary = true;
      }
    }

    setPlacePhotos(updatedPhotos);
    saveToStorage("sh_photos", updatedPhotos);
    return true;
  };

  const setPrimaryPhoto = (placeId: number, photoId: number) => {
    const hasPhoto = placePhotos.some((photo) => photo.id === photoId && photo.place_id === placeId);
    if (!hasPhoto) return false;

    const updated = placePhotos.map((photo) => {
      if (photo.place_id === placeId) {
        return { ...photo, is_primary: photo.id === photoId };
      }
      return photo;
    });

    setPlacePhotos(updated);
    saveToStorage("sh_photos", updated);
    return true;
  };

  // --- REVIEW OPERATIONS ---

  const createReview = (placeId: number, userId: number, rating: number, comment: string) => {
    const newId = reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) + 1 : 1;
    const newReview: Review = {
      id: newId,
      place_id: placeId,
      user_id: userId,
      rating,
      comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    saveToStorage("sh_reviews", updatedReviews);

    // Update avg rating & review count for the place
    updatePlaceStats(placeId, updatedReviews);

    return newReview;
  };

  const updateReview = (reviewId: number, rating: number, comment: string) => {
    const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) return null;

    const updatedReview: Review = {
      ...reviews[reviewIndex],
      rating,
      comment,
      updated_at: new Date().toISOString(),
    };

    const updatedReviews = reviews.map((r) => (r.id === reviewId ? updatedReview : r));
    setReviews(updatedReviews);
    saveToStorage("sh_reviews", updatedReviews);

    // Update stats for the place
    updatePlaceStats(updatedReview.place_id, updatedReviews);

    return updatedReview;
  };

  const deleteReview = (reviewId: number) => {
    const reviewToDelete = reviews.find((r) => r.id === reviewId);
    if (!reviewToDelete) return false;

    const updatedReviews = reviews.filter((r) => r.id !== reviewId);
    setReviews(updatedReviews);
    saveToStorage("sh_reviews", updatedReviews);

    // Update stats for the place
    updatePlaceStats(reviewToDelete.place_id, updatedReviews);

    return true;
  };

  // Helper to re-calculate place avg_rating and review_count
  const updatePlaceStats = (placeId: number, currentReviewsList: Review[]) => {
    const placeReviews = currentReviewsList.filter((r) => r.place_id === placeId);
    const reviewCount = placeReviews.length;
    let avgRating = 0;
    
    if (reviewCount > 0) {
      const sum = placeReviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Math.round((sum / reviewCount) * 10) / 10;
    }

    const updatedPlaces = places.map((p) => 
      p.id === placeId ? { ...p, avg_rating: avgRating, review_count: reviewCount } : p
    );
    setPlaces(updatedPlaces);
    saveToStorage("sh_places", updatedPlaces);
  };

  // --- USER OPERATIONS ---

  const createUser = (userData: Omit<User, "id" | "created_at">) => {
    const emailExists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      return { success: false, error: "Email already exists" };
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      ...userData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveToStorage("sh_users", updated);
    return { success: true, user: newUser };
  };

  const updateUser = (id: number, userData: Partial<User>) => {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return { success: false, error: "User not found" };

    if (userData.email) {
      const emailExists = users.some((u) => u.email.toLowerCase() === userData.email!.toLowerCase() && u.id !== id);
      if (emailExists) {
        return { success: false, error: "Email already taken" };
      }
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...userData,
    };

    const updated = users.map((u) => (u.id === id ? updatedUser : u));
    setUsers(updated);
    saveToStorage("sh_users", updated);

    // If updating currently logged in user, sync current user state too
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updatedUser);
      saveToStorage("sh_current_user", updatedUser);
    }

    return { success: true, user: updatedUser };
  };

  const deleteUser = (id: number) => {
    if (currentUser && currentUser.id === id) {
      return { success: false, error: "You cannot delete your own logged-in administrator account." };
    }

    const exists = users.some((u) => u.id === id);
    if (!exists) return { success: false, error: "User not found" };

    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    saveToStorage("sh_users", updatedUsers);

    // Cascade delete reviews submitted by this user
    const updatedReviews = reviews.filter((r) => r.user_id !== id);
    setReviews(updatedReviews);
    saveToStorage("sh_reviews", updatedReviews);

    // Cascade delete bookmarks
    const updatedBookmarks = bookmarks.filter((b) => b.user_id !== id);
    setBookmarks(updatedBookmarks);
    saveToStorage("sh_bookmarks", updatedBookmarks);

    // Re-verify average ratings for places affected by cascade review deletion
    const uniquePlaceIds = Array.from(new Set(reviews.filter((r) => r.user_id === id).map((r) => r.place_id)));
    setTimeout(() => {
      uniquePlaceIds.forEach((pId) => {
        updatePlaceStats(pId, updatedReviews);
      });
    }, 50);

    return { success: true };
  };

  if (!isInitialized) {
    return null; // Prevent hydration mismatch by loading after mount
  }

  return (
    <DBContext.Provider
      value={{
        categories,
        places,
        placePhotos,
        reviews,
        users,
        bookmarks,
        currentUser,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        createCategory,
        updateCategory,
        deleteCategory,
        createPlace,
        updatePlace,
        deletePlace,
        addPhoto,
        deletePhoto,
        setPrimaryPhoto,
        createReview,
        updateReview,
        deleteReview,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </DBContext.Provider>
  );
}

export function useDB() {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error("useDB must be used within a DBProvider");
  }
  return context;
}
