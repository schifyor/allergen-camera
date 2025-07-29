import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const divId = "qr-reader";

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(divId);
    scannerRef.current
      .start(
        { facingMode: "environment" }, // Rückkamera auf Mobilgeräten
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          onDetected(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // optional: console.warn(errorMessage);
        }
      )
      .catch((err) => {
        console.error("Scan-Fehler:", err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    scannerRef.current?.stop().then(() => {
      scannerRef.current?.clear();
    });
  };

  return <div id={divId} className="w-full max-w-sm mx-auto mt-4" />;
};

export default BarcodeScanner;
