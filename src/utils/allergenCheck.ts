import { distance } from "fastest-levenshtein";

const MAX_DISTANCE = 1;

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  "Gluten": ["gluten", "weizen", "weizenmehl", "roggen", "gerste", "dinkel", "hafer", "grünkern", "kamut", "kleie", "malz", "schrot", "bulgur", "couscous", "polenta", "paniermehl"],
  "Krebstiere": ["krebs", "shrimps", "krabben", "garnelen", "muscheln", "langusten", "hummer", "scampi", "crevetten", "krill", "seespinne"],
  "Eier": [" ei ", "mayonnaise", "eipulver", "eier"],
  "Fisch": ["fisch", "lachs", "thunfisch", "hering"],
  "Erdnüsse": ["erdnüsse", "erdnussöl", "erdnussbutter"],
  "Soja": ["soja", "sojamehl", "sojasauce"],
  "Milch": ["milch", "vollmilch", "magermilch", "butter", "joghurt", "kasein", "laktose"],
  "Laktose": ["laktose", "milchzucker"],
  "Schalenfrüchte": ["nüsse", "nuss", "haselnüsse", "mandeln", "walnüsse", "cashew", "paranüsse", "pistazien", "kaschunüsse", "nougat", "marzipan"],
  "Sellerie": ["sellerie", "knollensellerie"],
  "Senf": ["senf", "senfkörner", "senfmehl"],
  "Sesam": ["sesam", "sesamöl", "sesamsamen"],
  "Schwefel": ["e220", "e228"],
};

export const detectAllergens = (text: string): string[] => {
  const normalized = text.toLowerCase();
  const tokens = normalized.split(/[^a-zäöüß]+/).filter(t => t.length > 3); // ignoriere sehr kurze Tokens
  const found = new Set<string>();

  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    for (const keyword of keywords) {
      for (const token of tokens) {
        if (
          token === keyword ||                             // exakter Treffer
          distance(token, keyword) <= MAX_DISTANCE         // toleranter Treffer
        ) {
          found.add(`${token} (${allergen})`);
        }
      }
    }
  }

  return Array.from(found);
};
