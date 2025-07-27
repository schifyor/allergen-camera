import React, {useRef } from "react";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    // Datei nicht anzeigen lassen, deshalb nichts weiter tun
    event.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden" // input verstecken
      />
      <div className="text-center">
        <button
          type="button"
          onClick={handleClick}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors duration-200"
        >
          Bild auswählen
        </button>
      </div>
    </>
  );
}
