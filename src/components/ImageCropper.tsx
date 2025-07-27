import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type Props = {
  imageSrc: string;
  onCropped: (blob: Blob) => void;
};

export const ImageCropper: React.FC<Props> = ({ imageSrc, onCropped }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });

  const imgRef = useRef<HTMLImageElement | null>(null);

  const onImageLoaded = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
  }, []);

  const makeClientCrop = useCallback(async () => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedBlob = await getCroppedImg(imgRef.current, crop);
      onCropped(croppedBlob);
    }
  }, [crop, onCropped]);

  function getCroppedImg(image: HTMLImageElement, crop: Crop, scaleFactor = 3): Promise<Blob> {
    if (!crop.width || !crop.height) {
      return Promise.reject(new Error("Crop data is invalid"));
    }

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    // Crop-Werte in Prozent (z. B. 25% von 2000px) → absolute Werte
    const cropX = (crop.x! / 100) * naturalWidth;
    const cropY = (crop.y! / 100) * naturalHeight;
    const cropWidth = (crop.width! / 100) * naturalWidth;
    const cropHeight = (crop.height! / 100) * naturalHeight;

    // Höhere Auflösung durch Skalierung
    const canvas = document.createElement('canvas');
    canvas.width = cropWidth * scaleFactor;
    canvas.height = cropHeight * scaleFactor;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'contrast(150%) brightness(90%)';

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Schwarz-Weiss färben
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      data[i] = data[i + 1] = data[i + 2] = gray;
      // Alpha bleibt gleich (data[i+3])
    }

    ctx.putImageData(imageData, 0, 0);

    // Optional: Vorschau anzeigen zum Debuggen
    // document.body.appendChild(canvas);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    });
  }



  return (
    <div>
      {imageSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          keepSelection
          ruleOfThirds
        >
          <img
            src={imageSrc}
            alt="Zum Zuschneiden"
            onLoad={(e) => onImageLoaded(e.currentTarget)}
          />
        </ReactCrop>
      )}
      <div className="text-center">
        <button
          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors duration-200"
          onClick={makeClientCrop}
        >
          Ausschnitt übernehmen
        </button>
      </div>
    </div>
  );
};
