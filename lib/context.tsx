"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- TYPES & INTERFACES ---

export interface Category {
  id: number;
  name: string;
  icon: string; // Lucide icon name, e.g., "Building", "Church", "Compass", "Trees", "BookOpen", "Flag"
  is_active?: boolean;
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
  is_active?: boolean;
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
  is_active?: boolean;
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
  isInitialized: boolean;

  // Auth operations
  login: (email: string, password_hash: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string, password?: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;

  // Category CRUD
  createCategory: (name: string, icon: string) => Promise<Category>;
  updateCategory: (id: number, name: string, icon: string, isActive?: boolean) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Place CRUD
  createPlace: (placeData: Omit<Place, "id" | "avg_rating" | "review_count" | "created_at" | "updated_at">) => Promise<Place>;
  updatePlace: (id: number, placeData: Partial<Place>) => Promise<Place | null>;
  deletePlace: (id: number) => Promise<boolean>;

  // Photo operations
  addPhoto: (placeId: number, photoUrl: string, caption: string, isPrimary: boolean) => Promise<PlacePhoto>;
  deletePhoto: (photoId: number) => Promise<boolean>;
  setPrimaryPhoto: (placeId: number, photoId: number) => Promise<boolean>;

  // Review operations
  createReview: (placeId: number, userId: number, rating: number, comment: string) => Promise<Review>;
  updateReview: (reviewId: number, rating: number, comment: string, isActive?: boolean) => Promise<Review | null>;
  deleteReview: (reviewId: number) => Promise<boolean>;

  // User CRUD
  createUser: (userData: Omit<User, "id" | "created_at">) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUser: (id: number, userData: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  deleteUser: (id: number) => Promise<{ success: boolean; error?: string }>;
}

// --- CONTEXT PROVIDER ---

const DBContext = createContext<DBContextType | undefined>(undefined);

const API_URL = "http://localhost:4000/api";

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

  // Helper to call backend API
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sh_jwt_token") : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Request failed");
    }
    return json;
  };

  const loadData = async () => {
    try {
      // Fetch all required lists
      const [catsRes, placesRes, usersRes, reviewsRes, photosRes] = await Promise.all([
        apiFetch("/categories?all=true"),
        apiFetch("/places?all=true"),
        apiFetch("/users"),
        apiFetch("/reviews"),
        apiFetch("/places/photos/all"),
      ]);

      if (catsRes.success) setCategories(catsRes.data);
      if (placesRes.success) setPlaces(placesRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (reviewsRes.success) setReviews(reviewsRes.data);
      if (photosRes.success) setPlacePhotos(photosRes.data);
    } catch (error) {
      console.error("Failed to load backend data:", error);
    }
  };

  // Load state on mount
  useEffect(() => {
    const initAuth = async () => {
      const localAuth = localStorage.getItem("sh_current_user");
      const localToken = localStorage.getItem("sh_jwt_token");

      if (localAuth && localToken) {
        setCurrentUser(JSON.parse(localAuth));
        setIsAuthenticated(true);
        // Ensure cookies are synchronized on mount
        document.cookie = `sh_jwt_token=${localToken}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `sh_current_user=${encodeURIComponent(localAuth)}; path=/; max-age=604800; SameSite=Lax`;
        // Load data from live backend
        await loadData();
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // --- AUTH OPERATIONS ---

  const login = async (email: string, password_hash: string) => {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: password_hash }),
      });

      if (res.success) {
        localStorage.setItem("sh_jwt_token", res.token);
        localStorage.setItem("sh_current_user", JSON.stringify(res.user));
        // Write to cookies
        document.cookie = `sh_jwt_token=${res.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `sh_current_user=${encodeURIComponent(JSON.stringify(res.user))}; path=/; max-age=604800; SameSite=Lax`;

        setCurrentUser(res.user);
        setIsAuthenticated(true);
        // Load data right after login
        await loadData();
        return { success: true };
      }
      return { success: false, error: res.message || "Login failed" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("sh_current_user");
    localStorage.removeItem("sh_jwt_token");
    // Clear cookies
    document.cookie = "sh_jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sh_current_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCategories([]);
    setPlaces([]);
    setPlacePhotos([]);
    setReviews([]);
    setUsers([]);
  };

  const updateProfile = async (name: string, email: string, password?: string, avatarUrl?: string) => {
    if (!currentUser) return { success: false, error: "No user authenticated" };
    try {
      const updateData: any = { name, email, avatar_url: avatarUrl };
      
      // Update basic profile info
      const res = await apiFetch(`/users/${currentUser.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      // Update password if provided
      if (password) {
        await apiFetch(`/users/${currentUser.id}/password`, {
          method: "PUT",
          body: JSON.stringify({ new_password: password }),
        });
      }

      if (res.success) {
        const updatedUser = res.data;
        setCurrentUser(updatedUser);
        localStorage.setItem("sh_current_user", JSON.stringify(updatedUser));
        document.cookie = `sh_current_user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=604800; SameSite=Lax`;
        
        // Reload users list
        const usersRes = await apiFetch("/users");
        if (usersRes.success) setUsers(usersRes.data);

        return { success: true };
      }
      return { success: false, error: res.message || "Failed to update profile" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // --- CATEGORY OPERATIONS ---

  const createCategory = async (name: string, icon: string) => {
    const res = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name, icon }),
    });
    const newCategory = res.data;
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: number, name: string, icon: string, isActive?: boolean) => {
    const res = await apiFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, icon, is_active: isActive }),
    });
    const updated = res.data;
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCategory = async (id: number) => {
    try {
      const res = await apiFetch(`/categories/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to delete category" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // --- PLACE OPERATIONS ---

  const createPlace = async (placeData: Omit<Place, "id" | "avg_rating" | "review_count" | "created_at" | "updated_at">) => {
    const res = await apiFetch("/places", {
      method: "POST",
      body: JSON.stringify(placeData),
    });
    const newPlace = res.data;
    setPlaces((prev) => [...prev, newPlace]);
    return newPlace;
  };

  const updatePlace = async (id: number, placeData: Partial<Place>) => {
    const res = await apiFetch(`/places/${id}`, {
      method: "PUT",
      body: JSON.stringify(placeData),
    });
    const updated = res.data;
    setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePlace = async (id: number) => {
    try {
      const res = await apiFetch(`/places/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        // Refresh photos and reviews as they are cascade deleted in the backend
        const [photosRes, reviewsRes] = await Promise.all([
          apiFetch("/places/photos/all"),
          apiFetch("/reviews"),
        ]);
        if (photosRes.success) setPlacePhotos(photosRes.data);
        if (reviewsRes.success) setReviews(reviewsRes.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // --- PHOTO OPERATIONS ---

  const addPhoto = async (placeId: number, photoUrl: string, caption: string, isPrimary: boolean) => {
    const res = await apiFetch(`/places/${placeId}/photos`, {
      method: "POST",
      body: JSON.stringify({ photo_url: photoUrl, caption, is_primary: isPrimary }),
    });
    const newPhoto = res.data;
    
    // Refresh all photos to sync is_primary changes
    const photosRes = await apiFetch("/places/photos/all");
    if (photosRes.success) setPlacePhotos(photosRes.data);
    
    return newPhoto;
  };

  const deletePhoto = async (photoId: number) => {
    try {
      const photoToDelete = placePhotos.find((p) => p.id === photoId);
      if (!photoToDelete) return false;

      const res = await apiFetch(`/places/${photoToDelete.place_id}/photos/${photoId}`, {
        method: "DELETE",
      });

      if (res.success) {
        // Refresh all photos to sync is_primary adjustments
        const photosRes = await apiFetch("/places/photos/all");
        if (photosRes.success) setPlacePhotos(photosRes.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const setPrimaryPhoto = async (placeId: number, photoId: number) => {
    try {
      const res = await apiFetch(`/places/${placeId}/photos/${photoId}`, {
        method: "PUT",
        body: JSON.stringify({ is_primary: true }),
      });

      if (res.success) {
        // Refresh all photos
        const photosRes = await apiFetch("/places/photos/all");
        if (photosRes.success) setPlacePhotos(photosRes.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // --- REVIEW OPERATIONS ---

  const createReview = async (placeId: number, userId: number, rating: number, comment: string) => {
    const res = await apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify({ place_id: placeId, rating, comment }),
    });
    const newReview = res.data;
    setReviews((prev) => [...prev, newReview]);

    // Refresh places to get updated avg_rating & review_count
    const placesRes = await apiFetch("/places?all=true");
    if (placesRes.success) setPlaces(placesRes.data);

    return newReview;
  };

  const updateReview = async (reviewId: number, rating: number, comment: string, isActive?: boolean) => {
    const res = await apiFetch(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify({ rating, comment, is_active: isActive }),
    });
    const updated = res.data;
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));

    // Refresh places to get updated stats
    const placesRes = await apiFetch("/places?all=true");
    if (placesRes.success) setPlaces(placesRes.data);

    return updated;
  };

  const deleteReview = async (reviewId: number) => {
    try {
      // Attempt admin delete route first
      const res = await apiFetch(`/reviews/${reviewId}/admin`, {
        method: "DELETE",
      });

      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        
        // Refresh places to get updated stats
        const placesRes = await apiFetch("/places?all=true");
        if (placesRes.success) setPlaces(placesRes.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // --- USER OPERATIONS ---

  const createUser = async (userData: Omit<User, "id" | "created_at">) => {
    try {
      const { password_hash, ...rest } = userData as any;
      const body = {
        ...rest,
        password: password_hash,
      };

      const res = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.success) {
        const newUser = res.data;
        setUsers((prev) => [...prev, newUser]);
        return { success: true, user: newUser };
      }
      return { success: false, error: res.message || "Failed to create user" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      const { password_hash, ...rest } = userData;
      const res = await apiFetch(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
      });

      if (password_hash) {
        await apiFetch(`/users/${id}/password`, {
          method: "PUT",
          body: JSON.stringify({ new_password: password_hash }),
        });
      }

      if (res.success) {
        const updated = res.data;
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
          localStorage.setItem("sh_current_user", JSON.stringify(updated));
          document.cookie = `sh_current_user=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=604800; SameSite=Lax`;
        }
        return { success: true, user: updated };
      }
      return { success: false, error: res.message || "Failed to update user" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const res = await apiFetch(`/users/${id}`, {
        method: "DELETE",
      });

      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        // Refresh reviews since user reviews are cascade deleted or updated
        const reviewsRes = await apiFetch("/reviews");
        if (reviewsRes.success) setReviews(reviewsRes.data);
        return { success: true };
      }
      return { success: false, error: res.message || "Failed to delete user" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  if (!isInitialized) {
    return null; // Prevent hydration mismatch
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
        isInitialized,
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
