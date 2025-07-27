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
      undefined,
      videoRef.current!,
      (result: Result | undefined, err) => {
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
