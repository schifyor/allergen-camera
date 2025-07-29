import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { Result } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => {
      stopScan(); // bei Komponentenausbau stoppen
    };
  }, []);

  const startScan = async () => {
    if (!readerRef.current || !videoRef.current) {
      setError("Scanner konnte nicht initialisiert werden.");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result: Result | undefined, err: unknown) => {
          if (result) {
            onDetected(result.getText());
            stopScan();
          }
          if (err && (err as any).name !== "NotFoundException") {
            console.error("Fehler beim Dekodieren:", err);
          }
        }
      );
    } catch (err) {
      console.error("Fehler beim Starten der Kamera:", err);
      setError("Kamera konnte nicht gestartet werden.");
      setScanning(false);
    }
  };

  const stopScan = () => {
    setScanning(false);
    // Kamera-Streams beenden
    BrowserMultiFormatReader.releaseAllStreams();
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

      {error && (
        <div className="mt-4 text-red-600 font-semibold">{error}</div>
      )}
    </div>
  );
};

export default BarcodeScanner;
