import Tesseract from "tesseract.js";

export const extractTextFromImage = async (image: File): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(
    image,
    'deu',
    {
      logger: m => console.log(m)
    }
  );
  return text;
};

export const extractTextFromBlob = async (image: Blob): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(
    image,
    'deu',
    {
      logger: m => console.log(m)
    }
  );
  return text;
};
