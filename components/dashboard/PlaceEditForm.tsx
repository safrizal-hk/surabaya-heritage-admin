"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDB, Place, Category, PlacePhoto } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Save,
  MapPin,
  Clock,
  Phone,
  ImageIcon,
  Trash2,
  Plus,
  Landmark,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MapPicker from "@/components/MapPicker";

interface PlaceEditFormProps {
  placeId: number;
  initialPlace: Place | null;
  initialCategories: Category[];
  initialPlacePhotos: PlacePhoto[];
}

export default function PlaceEditForm({
  placeId,
  initialPlace,
  initialCategories,
  initialPlacePhotos
}: PlaceEditFormProps) {
  const {
    places,
    categories: contextCategories,
    placePhotos: contextPhotos,
    updatePlace,
    addPhoto,
    deletePhoto,
    setPrimaryPhoto
  } = useDB();
  
  const { toast } = useToast();
  const router = useRouter();

  // Find target place from context first, fallback to server data
  const placeFromContext = places.find((p) => p.id === placeId);
  const place = placeFromContext || initialPlace;

  const categories = contextCategories.length > 0 ? contextCategories : initialCategories;
  const placePhotos = contextPhotos.length > 0 ? contextPhotos : initialPlacePhotos;

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Opening hours per day
  const [openingHours, setOpeningHours] = useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });

  // Photo uploads state
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [addingPhoto, setAddingPhoto] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with place details
  useEffect(() => {
    if (place) {
      setName(place.name);
      setCategoryId(place.category_id.toString());
      setGooglePlaceId(place.google_place_id || "");
      setAddress(place.address);
      setLat(place.lat);
      setLng(place.lng);
      setDescription(place.description || "");
      setPhone(place.phone || "");
      setWebsite(place.website || "");
      setIsActive(place.is_active);
      if (place.opening_hours) {
        setOpeningHours({ ...place.opening_hours });
      }
    }
  }, [place]);

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Landmark className="h-12 w-12 text-zinc-300" />
        <h2 className="text-xl font-bold text-zinc-900">Heritage Location Not Found</h2>
        <p className="text-sm text-zinc-500">The historical place you are looking to edit does not exist or has been deleted.</p>
        <Link href="/dashboard/places">
          <Button variant="outline" size="sm">
            Back to All Places
          </Button>
        </Link>
      </div>
    );
  }

  const handleOpeningHoursChange = (day: keyof typeof openingHours, value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Place name is required.";
    if (!categoryId) newErrors.categoryId = "Category selection is required.";
    if (!address.trim()) newErrors.address = "Address is required.";
    if (isNaN(lat) || lat < -90 || lat > 90) newErrors.lat = "Latitude must be between -90 and 90.";
    if (isNaN(lng) || lng < -180 || lng > 180) newErrors.lng = "Longitude must be between -180 and 180.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      await updatePlace(placeId, {
        name,
        slug,
        category_id: parseInt(categoryId),
        google_place_id: googlePlaceId || undefined,
        address,
        lat: parseFloat(lat.toString()),
        lng: parseFloat(lng.toString()),
        description,
        opening_hours: openingHours,
        phone: phone || undefined,
        website: website || undefined,
        is_active: isActive,
      });

      setLoading(false);
      toast({
        title: "Place Updated",
        description: `Successfully modified details for "${name}".`,
        type: "success",
      });
      router.push("/dashboard/places");
    } catch (err: any) {
      setLoading(false);
      toast({
        title: "Error Updating Place",
        description: err.message || "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  const handleMapChange = (newLat: number, newLng: number) => {
    setLat(Math.round(newLat * 1000000) / 1000000);
    setLng(Math.round(newLng * 1000000) / 1000000);
  };

  const photos = placePhotos.filter((p) => p.place_id === placeId);

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) {
      toast({
        title: "Input Error",
        description: "Please provide a valid image URL.",
        type: "error",
      });
      return;
    }

    setAddingPhoto(true);
    
    try {
      const isPrimary = photos.length === 0;
      await addPhoto(placeId, newPhotoUrl.trim(), newPhotoCaption.trim() || "Landmark View", isPrimary);
      setNewPhotoUrl("");
      setNewPhotoCaption("");
      setAddingPhoto(false);
      
      toast({
        title: "Photo Added",
        description: "The media asset was successfully linked to this landmark.",
        type: "success",
      });
    } catch (err: any) {
      setAddingPhoto(false);
      toast({
        title: "Error Adding Photo",
        description: err.message || "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const success = await deletePhoto(photoId);
      if (success) {
        toast({
          title: "Photo Deleted",
          description: "Image successfully removed from database.",
          type: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error Deleting Photo",
        description: err.message || "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      const success = await setPrimaryPhoto(placeId, photoId);
      if (success) {
        toast({
          title: "Primary Photo Updated",
          description: "Main thumbnail image updated successfully.",
          type: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error Setting Primary Photo",
        description: err.message || "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Back and Page title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/places">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-955">Edit Heritage Place</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info Card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-zinc-400" />
              <span>General Information</span>
            </CardTitle>
            <CardDescription className="text-xs">Update place catalog information details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Place Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Place Name <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. Hotel Majapahit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`border-zinc-200 focus-visible:ring-1 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
            </div>

            {/* Grid Category & Google Place ID */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Category <span className="text-destructive">*</span></label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer ${
                    errors.categoryId ? "border-destructive focus-visible:ring-destructive" : "border-zinc-200"
                  }`}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-[10px] text-destructive font-semibold">{errors.categoryId}</p>}
              </div>

              {/* Google Place ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Google Place ID (Optional)</label>
                <Input
                  placeholder="e.g. ChIJ88888888"
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  className="border-zinc-200"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Description</label>
              <Textarea
                placeholder="Describe historical significance..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-zinc-200 focus-visible:ring-1 resize-y"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/30">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-zinc-800">Publishing Status</span>
                <span className="text-[10px] text-zinc-400 font-semibold">Decide if this landmark is visible in the mobile application.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-ring dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details Card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <Phone className="h-4.5 w-4.5 text-zinc-400" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription className="text-xs">Update landmark contact lines.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Phone Number</label>
              <Input
                placeholder="e.g. +62 31 3531426"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-zinc-200"
              />
            </div>
            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Website URL</label>
              <Input
                placeholder="e.g. https://www.website.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="border-zinc-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-zinc-400" />
              <span>Opening Hours</span>
            </CardTitle>
            <CardDescription className="text-xs">Update schedules of operation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Object.keys(openingHours).map((day) => {
              const dayKey = day as keyof typeof openingHours;
              return (
                <div key={day} className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{day}</label>
                  <Input
                    placeholder="e.g. 08:00 - 16:00 or Closed"
                    value={openingHours[dayKey] || ""}
                    onChange={(e) => handleOpeningHoursChange(dayKey, e.target.value)}
                    className="h-8.5 text-xs border-zinc-200"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Map Location Card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-zinc-400" />
              <span>Geographic Location</span>
            </CardTitle>
            <CardDescription className="text-xs">Adjust address coordinates interactively or manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Street Address</label>
              <Textarea
                placeholder="Complete address..."
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`border-zinc-200 focus-visible:ring-1 resize-none ${
                  errors.address ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {errors.address && <p className="text-[10px] text-destructive font-semibold">{errors.address}</p>}
            </div>

            {/* Coordinates */}
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Latitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="h-8.5 text-xs border-zinc-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Longitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="h-8.5 text-xs border-zinc-200"
                />
              </div>
            </div>

            {/* Interactive map */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Location Map</label>
              <MapPicker lat={lat} lng={lng} onChange={handleMapChange} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-100 p-6 flex items-center justify-end gap-3 bg-zinc-50/30">
            <Link href="/dashboard/places">
              <Button type="button" variant="outline" className="h-9.5 text-xs cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="h-9.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Saving Details...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Place Details</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Photo Management Card */}
      <Card className="bg-white border-zinc-200 shadow-2xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
            <ImageIcon className="h-4.5 w-4.5 text-zinc-400" />
            <span>Place Photos ({photos.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">Manage photographs and designate primary catalog thumbnail.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Photo Form */}
          <form onSubmit={handleAddPhotoSubmit} className="space-y-3 p-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50">
            <div className="text-xs font-bold text-zinc-800 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
              <span>Add New Landmark Photo</span>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Direct Image URL (e.g. Unsplash URL)..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="h-8 text-xs border-zinc-200 bg-white"
              />
              <Input
                placeholder="Short description / caption..."
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                className="h-8 text-xs border-zinc-200 bg-white"
              />
            </div>
            <Button type="submit" size="sm" className="w-full h-8 text-[11px] font-semibold cursor-pointer" disabled={addingPhoto}>
              {addingPhoto ? "Adding Asset..." : "Link New Photo"}
            </Button>
          </form>

          {/* Photos Gallery List */}
          <div className="grid gap-4 sm:grid-cols-2">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-zinc-200 shadow-3xs flex flex-col bg-white">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between">
                    <p className="text-[10px] text-zinc-500 font-semibold italic line-clamp-1">&ldquo;{photo.caption}&rdquo;</p>
                    
                    <div className="flex items-center justify-between gap-1 mt-1">
                      {photo.is_primary ? (
                        <Badge variant="success" className="text-[9px] px-1 py-0 font-bold shrink-0">
                          Primary Photo
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-5 px-1.5 text-[9px] font-semibold text-zinc-500 hover:text-zinc-955 shrink-0 cursor-pointer"
                          onClick={() => handleSetPrimary(photo.id)}
                        >
                          Set Primary
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-zinc-400 text-xs">
                No photographs added yet. Add a photo URL above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
