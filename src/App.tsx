import React, { useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { ImageCropper } from "./components/ImageCropper";
import BarcodeScanner from "./components/BarcodeScanner";
import { extractTextFromImage, extractTextFromBlob } from "./ocr/ocrWorker";
import { detectAllergens } from "./utils/allergenCheck";
import { preprocessImage } from "./utils/imagePreprocessing";


type Mode = "barcode" | "image";

function App() {
  const [ocrText, setOcrText] = useState<string>("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string>();
  const [processedBlob, setProcessedBlob] = useState<Blob>();
  const [ingredients, setIngredients] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("barcode");

  const handleImageUpload = (file: File) => {
    setImageData(URL.createObjectURL(file));
  };

  const handleBarcodeDetected = (barcode: string) => {
    fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 1) {
          setIngredients(data.product.ingredients_text || "Keine Zutaten gefunden");
        } else {
          setIngredients("Produkt nicht gefunden");
        }
      })
      .catch(() => setIngredients("Fehler beim Laden der Produktdaten"));
  };

  const handleCropFinished = async (croppedBlob: Blob) => {
    setLoading(true);
    const enhancedBlob = await preprocessImage(croppedBlob);
    setProcessedBlob(enhancedBlob);

    const text = await extractTextFromBlob(enhancedBlob);
    const found = detectAllergens(text);
    setOcrText(text);
    setAllergens(found);
    setLoading(false);
    setImageData(undefined); // Cropper ausblenden
  };


  const handleImage = async (file: File) => {
    setLoading(true);
    setImageData(URL.createObjectURL(file));
    const text = await extractTextFromImage(file);
    const found = detectAllergens(text);
    setOcrText(text);
    setAllergens(found);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center p-6">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-center text-3xl font-extrabold mb-6 text-green-800 border-b-4 border-green-400 pb-2">
          Allergen Checker
        </h1>

        {/* Toggle */}
        <div className="px-6 py-3 text-center">
          <button
            onClick={() => setMode("barcode")}
            className={`px-6 py-3 rounded-md mr-2 font-semibold transition-colors hover:bg-green-700 duration-200
                        ${mode === "barcode" ? "bg-green-600 text-white" : "bg-gray-300 text-black"}
                      `}
          >
            Barcode scannen
          </button>
          <button
            onClick={() => setMode("image")}
            className={`px-6 py-3 rounded-md mr-2 font-semibold transition-colors hover:bg-green-700 duration-200
                        ${mode === "image" ? "bg-green-600 text-white" : "bg-gray-300 text-black"}
                      `}
          >
            Bild hochladen
          </button>
        </div>

        {/* Barcode Scanner */}
        {mode === "barcode" && (
          <BarcodeScanner onDetected={handleBarcodeDetected} />
        )}

        {/* Bildauswahl und Cropping*/}
        {mode === "image" && ( 
          <ImageUploader onImageSelected={handleImageUpload} />
        )}

        {imageData && (
          <div className="my-6">
            <ImageCropper
              imageSrc={imageData}
              onCropped={handleCropFinished}
            />
          </div>
        )}

        {loading && (
          <p className="text-center text-green-600 font-medium animate-pulse">
            Texterkennung läuft...
          </p>
        )}

        {!loading && ocrText && (
          <section className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Erkannter Text:
              </h2>
              <pre className="bg-gray-50 rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-auto border border-green-200 shadow-inner">
                {ocrText}
              </pre>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Gefundene Allergene:
              </h2>
              {allergens.length > 0 ? (
                <ul className="list-disc list-inside text-red-600 font-semibold space-y-1">
                  {allergens.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 font-semibold">
                  Keine Allergene gefunden ✅
                </p>
              )}
            </div>
          </section>
        )}

        {/* Zutaten anzeigen */}
        {ingredients && (
          <div>
            <h3>Zutaten:</h3>
            <p>{ingredients}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
