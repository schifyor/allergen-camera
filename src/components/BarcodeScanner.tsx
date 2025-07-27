import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScan = () => {
    setScanning(true);
    if (!videoRef.current || !codeReader.current) return;
    codeReader.current.decodeFromVideoDevice(
      null,
      videoRef.current!,
      (result: Result | null, err) => {
        if (result) {
          setScanning(false);
          codeReader.current?.reset();
          stopScan();
          onDetected(result.getText());
        }
        // Fehler ignorieren, falls kein Barcode gefunden wurde (NotFoundException)
        if (err && !(err.name === "NotFoundException")) {
          console.error(err);
        }
      }
    );
  };

  const stopScan = () => {
    setScanning(false);
    codeReader.current?.reset();
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
