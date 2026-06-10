"use client";

import dynamic from "next/dynamic";
import * as React from "react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  editable?: boolean;
}

const DynamicMap = dynamic(() => import("./MapPickerContent"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex flex-col items-center justify-center bg-zinc-50 rounded-lg border border-zinc-200 text-sm text-zinc-400 gap-2">
      <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
      <span>Loading Interactive Map...</span>
    </div>
  ),
});

export default function MapPicker(props: MapPickerProps) {
  return <DynamicMap {...props} />;
}
