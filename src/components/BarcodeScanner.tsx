import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const [ready, setReady] = useState(false);

  const activeScan = useRef<ReturnType<BrowserMultiFormatReader["decodeFromVideoDevice"]> | null>(null);

  useEffect(() => {
  codeReader.current = new BrowserMultiFormatReader();
  setReady(true);

  return () => {
    activeScan.current?.then(r => r?.stop());
  };
}, []);

  const startScan = () => {
    setScanning(true);

    if (!ready || !videoRef.current || !codeReader.current) {
      console.error("Scanner oder Video nicht bereit");
      return;
    }

    console.log("Starte Kamera und Barcode-Scan...");

    activeScan.current = codeReader.current.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error) => {
        if (result) {
          console.log("Barcode erkannt:", result.getText());
          onDetected(result.getText());
          stopScan();
        }
        if (error && error.name !== "NotFoundException") {
          console.error("Scan-Fehler:", error);
        }
      }
    );
  };

  const stopScan = () => {
    setScanning(false);
    if (activeScan.current) {
      activeScan.current.then((result) => result?.stop());
      activeScan.current = null;
    }
    console.log("Scan gestoppt");
  };

  return (
    <div className="text-center">
      {!scanning ? (
        <button
          onClick={startScan}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
        >
          Barcode scannen
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full max-w-sm mt-4 border"
            muted
            autoPlay
            playsInline
          />
          <br />
          <button
            onClick={stopScan}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Scan abbrechen
          </button>
        </>
      )}
    </div>
  );
};

export default BarcodeScanner;
