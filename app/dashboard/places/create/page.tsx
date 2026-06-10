"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import { Landmark, ArrowLeft, Save, MapPin, Clock, Phone, Globe, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MapPicker from "@/components/MapPicker";

export default function CreatePlacePage() {
  const { categories, createPlace, addPhoto } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(-7.2572); // Default to Surabaya center
  const [lng, setLng] = useState(112.7388);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Opening hours per day
  const [openingHours, setOpeningHours] = useState({
    monday: "08:00 - 16:00",
    tuesday: "08:00 - 16:00",
    wednesday: "08:00 - 16:00",
    thursday: "08:00 - 16:00",
    friday: "08:00 - 16:00",
    saturday: "08:00 - 15:00",
    sunday: "08:00 - 15:00",
  });

  // Photo URL (Optionally add primary photo on creation)
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("Main entrance view");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Simulate lag
    setTimeout(() => {
      const newPlace = createPlace({
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

      // If a photo was entered, save it
      if (photoUrl.trim()) {
        addPhoto(newPlace.id, photoUrl.trim(), photoCaption.trim() || "Primary Photo", true);
      } else {
        // Add default placeholder photo if empty
        addPhoto(
          newPlace.id,
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
          "Surabaya Landmark default view",
          true
        );
      }

      setLoading(false);
      toast({
        title: "Place Created",
        description: `Successfully catalogued "${name}".`,
        type: "success",
      });
      router.push("/dashboard/places");
    }, 600);
  };

  // Map coordinates click callback
  const handleMapChange = (newLat: number, newLng: number) => {
    setLat(Math.round(newLat * 1000000) / 1000000);
    setLng(Math.round(newLng * 1000000) / 1000000);
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Add Heritage Place</h1>
          <p className="text-xs text-zinc-500 font-medium">Create and catalog a new historical heritage landmark.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-full mx-auto space-y-6">
        {/* General Information card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-zinc-400" />
              <span>General Information</span>
            </CardTitle>
            <CardDescription className="text-xs">Provide descriptive information about the heritage place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Place Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Place Name <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. Tugu Pahlawan"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className={`border-zinc-200 focus-visible:ring-1 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
            </div>

            {/* Grid Category & Google Place ID */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Category <span className="text-destructive">*</span></label>
                <select
                  value={categoryId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGooglePlaceId(e.target.value)}
                  className="border-zinc-200"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Description</label>
              <Textarea
                placeholder="Describe the historical context, architectural design, significance, and interesting details of the place..."
                rows={6}
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
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
              <span>Contact & Media</span>
            </CardTitle>
            <CardDescription className="text-xs">Add contact numbers, websites, and set up the primary photo link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Phone Number</label>
                <Input
                  placeholder="e.g. +62 31 3571100"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  className="border-zinc-200"
                />
              </div>
              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Website URL</label>
                <Input
                  placeholder="e.g. https://www.surabaya.go.id"
                  value={website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
                  className="border-zinc-200"
                />
              </div>
            </div>

            {/* Photo Upload Simulation Input */}
            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Primary Photo URL</label>
                <Input
                  placeholder="Paste a direct image URL (or leave blank for default placeholder)..."
                  value={photoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhotoUrl(e.target.value)}
                  className="border-zinc-200"
                />
              </div>
              {photoUrl.trim() && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Photo Caption</label>
                  <Input
                    placeholder="e.g. Main building entrance"
                    value={photoCaption}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhotoCaption(e.target.value)}
                    className="border-zinc-200"
                  />
                </div>
              )}
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
            <CardDescription className="text-xs">Define opening schedules for each day of the week.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Object.keys(openingHours).map((day) => {
              const dayKey = day as keyof typeof openingHours;
              return (
                <div key={day} className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{day}</label>
                  <Input
                    placeholder="e.g. 08:00 - 16:00 or Closed"
                    value={openingHours[dayKey]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOpeningHoursChange(dayKey, e.target.value)}
                    className="h-8.5 text-xs border-zinc-200"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Location picker card */}
        <Card className="bg-white border-zinc-200 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-950 flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-zinc-400" />
              <span>Geographic Location</span>
            </CardTitle>
            <CardDescription className="text-xs">Specify coordinates manually or interactively pick on the map.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Street Address <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="Complete physical address..."
                rows={2}
                value={address}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
                className={`border-zinc-200 focus-visible:ring-1 resize-none ${
                  errors.address ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {errors.address && <p className="text-[10px] text-destructive font-semibold">{errors.address}</p>}
            </div>

            {/* Coordinates Inputs */}
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Latitude <span className="text-destructive">*</span></label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="-7.2572"
                  value={lat === 0 ? "" : lat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLat(parseFloat(e.target.value) || 0)}
                  className={`h-8.5 text-xs border-zinc-200 ${errors.lat ? "border-destructive focus:ring-destructive" : ""}`}
                />
                {errors.lat && <p className="text-[10px] text-destructive font-semibold">{errors.lat}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Longitude <span className="text-destructive">*</span></label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="112.7388"
                  value={lng === 0 ? "" : lng}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLng(parseFloat(e.target.value) || 0)}
                  className={`h-8.5 text-xs border-zinc-200 ${errors.lng ? "border-destructive focus:ring-destructive" : ""}`}
                />
                {errors.lng && <p className="text-[10px] text-destructive font-semibold">{errors.lng}</p>}
              </div>
            </div>

            {/* Interactive map */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Interactive Map Pick</label>
              <MapPicker lat={lat} lng={lng} onChange={handleMapChange} />
            </div>
          </CardContent>
          
          {/* Form actions footer */}
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
                  <span>Saving Place...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Heritage Place</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
