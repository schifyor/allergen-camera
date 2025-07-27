import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

export function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    setScanning(true);
    const videoElement = videoRef.current;
    if (!videoElement) {
      console.error("Kein Videoelement gefunden.");
      return;
    }

    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    try {
      console.log("Starte Kamera...");
      await codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoElement,
        (result: Result | undefined, err) => {
          if (result) {
            console.log("Barcode erkannt:", result.getText());
            stopScan();
            onDetected(result.getText());
          }

          if (err && err.name !== "NotFoundException") {
            console.error("Scanfehler:", err);
          }
        }
      );
    } catch (err) {
      console.error("Fehler beim Zugriff auf Kamera:", err);
    }
  };

  const stopScan = () => {
    setScanning(false);
    codeReaderRef.current?.reset();
  };

  return (
    <div>
      <div className="text-center">
        <button 
          onClick={startScan}
          disabled={scanning}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors duration-200"
        >
          Barcode scannen
        </button>
      </div>
      {scanning && (
        <div>
          <video
            ref={videoRef}
            style={{ width: "100%", maxWidth: 400 }}
            muted
            playsInline
            autoPlay
          />
          <button onClick={stopScan}>Scan abbrechen</button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
