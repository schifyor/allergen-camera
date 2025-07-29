import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const divId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Prüfen, ob Kamera verfügbar ist
    if (!Html5Qrcode.getCameras) {
      console.error("Kamera-Zugriff nicht verfügbar.");
      return;
    }

    const initScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) {
          console.error("Keine Kamera gefunden.");
          return;
        }

        scannerRef.current = new Html5Qrcode(divId);

        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          (decodedText) => {
            onDetected(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Fehler beim Scannen ignorieren (z.B. nichts erkannt)
            // console.warn(errorMessage);
          }
        );
      } catch (err) {
        console.error("Scanner konnte nicht gestartet werden:", err);
      }
    };

    initScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (scannerRef.current?.getState() === 2) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current?.clear())
        .catch((err) => {
          console.warn("Scanner konnte nicht gestoppt werden:", err.message);
        });
    }
  };

  return <div id={divId} className="w-full max-w-sm mx-auto mt-4" />;
};

export default BarcodeScanner;
