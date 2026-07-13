// Generate showcase images using GLM-Image API
// Usage: node scripts/generate-showcase.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Manually parse .env.local for the GLM API key
const envRaw = readFileSync(resolve(ROOT, ".env.local"), "utf-8");
const envLines = envRaw.split("\n");
let GLM_API_KEY = "";
for (const line of envLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith("GLM_API_KEY=")) {
    GLM_API_KEY = trimmed.replace("GLM_API_KEY=", "").trim();
    break;
  }
}

if (!GLM_API_KEY) {
  console.error("❌ GLM_API_KEY not found in .env.local");
  process.exit(1);
}

const API_URL = "https://open.bigmodel.cn/api/paas/v4/images/generations";
const OUT_DIR = resolve(ROOT, "public", "showcase");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Showcase items with specific design prompts
const items = [
  {
    id: "1",
    title: "Artisan Coffee Brand Logo",
    prompt: "A minimalist artisan coffee brand logo called 'Ember & Oak', circular badge design with a stylized oak leaf and subtle flame motif, warm earthy tones of espresso brown, terracotta, and cream, handcrafted letterpress texture, vintage yet modern, on a clean cream background. High quality graphic design, vector style."
  },
  {
    id: "2",
    title: "Jazz Night Event Poster",
    prompt: "A moody jazz event poster for 'Blue Hour' at an underground club, deep midnight navy background with aged brass and gold accents, a saxophone silhouette with the bell morphing into smoke swirls, art deco typography, 1950s Blue Note Records style, elegant and atmospheric. High quality poster design."
  },
  {
    id: "3",
    title: "Meditation App Home Screen",
    prompt: "A meditation mobile app home screen design on iOS, calming gradient background transitioning from soft dawn pink to pale sky blue, greeting text 'Good morning, Sarah', a single warm amber 'Begin' button, white session cards with watercolor icons and subtle progress rings, clean minimal UI with plenty of whitespace, bottom tab navigation. Mobile app UI design, clean modern interface."
  },
  {
    id: "4",
    title: "Risograph Photo Remix",
    prompt: "A bold risograph-style poster, three-color separation in fluorescent pink, sunflower yellow, and midnight blue, visible halftone dots and slight color misregistration, DIY zine aesthetic, portrait of a woman with stage name 'SOLSTICE' in hand-stamped letterpress type along the right edge, raw paper texture showing through, underground art style. Graphic design print."
  },
  {
    id: "5",
    title: "Fashion Brand Moodboard",
    prompt: "A sustainable fashion brand moodboard for 'Terra Form', 4-column grid layout with raw linen fabric macro shots, earthy color palette swatches (cream, sandstone, sage green, terracotta, charcoal), editorial photos of relaxed-fit linen garments in natural light, Japanese kintsugi pottery and minimalist architecture references, wabi-sabi meets modern Scandinavian luxury aesthetic. Editorial moodboard design."
  },
  {
    id: "6",
    title: "Abstract Geometric Poster",
    prompt: "A Bauhaus-inspired abstract geometric poster, bold primary colors of red, blue, and yellow with black geometric lines, diagonal yellow band at 31 degrees cutting across the composition, a small coral accent circle, segmented black vertical bars creating rhythm, subtle grain and texture in each color block, A1 portrait format, contemporary modern art print. High quality graphic poster design."
  },
  {
    id: "7",
    title: "Sculptural Ceramic Vase",
    prompt: "A sculptural ceramic vase with organic flowing curves, matte off-white glaze with subtle speckle texture, photographed on a simple wooden surface against a warm neutral background, soft natural window light creating gentle shadows, minimalist product photography, Japanese ceramic art influence. Clean product shot."
  },
  {
    id: "8",
    title: "Neon Typography Sign",
    prompt: "A neon typography sign for a cocktail bar, the word 'GLOW' in custom cursive neon lettering, warm amber and pink glass tubes glowing against a dark brick wall background, slight ambient light spill creating a moody atmosphere, urban nightlife aesthetic, photographed with slight bokeh effect. Neon sign photography, cinematic lighting."
  },
  {
    id: "9",
    title: "Matcha Packaging Design",
    prompt: "A minimalist matcha green tea packaging design, a matte sage green tin container with a bamboo lid, subtle Japanese-inspired wave pattern embossed on the surface, clean modern typography in cream white, photographed on a light wood surface with a bamboo whisk and a small ceramic cup beside it, serene and premium natural aesthetic. Product packaging design photography."
  },
  {
    id: "10",
    title: "Vintage Travel Poster",
    prompt: "A vintage travel poster for Santorini Greece, iconic white-washed buildings with blue domes overlooking the Aegean Sea, warm sunset sky in gradients of orange and pink, classic 1930s travel poster art style with aged paper texture, elegant art deco border, the text 'SANTORINI' in vintage serif typography. Retro travel poster illustration."
  },
  {
    id: "11",
    title: "Minimalist Interior Render",
    prompt: "A photorealistic render of a minimalist Japandi-style living room, warm oak wood flooring, shoji-inspired sliding screen divider with translucent washi paper, low-profile linen sofa in oatmeal color, a live-edge walnut coffee table, a fiddle-leaf fig plant near a large east-facing window with soft morning light streaming through sheer curtains, walls in warm off-white plaster with subtle hand-troweled texture, peaceful sanctuary atmosphere. Interior design render, architectural visualization."
  },
  {
    id: "12",
    title: "Sunset Mountain Landscape",
    prompt: "A breathtaking cinematic landscape photograph of the Italian Dolomites at twilight, jagged limestone peaks silhouetted against a dramatic sky transitioning from deep indigo through violet and magenta to brilliant orange-gold at the horizon, long streaked altocumulus clouds catching the last sunlight like brush strokes, a dark pine forest at the base, a tiny alpine lake reflecting the colors, a single warm-lit cabin window visible on a distant ridge giving a sense of scale. Ultra wide 21:9 cinematic aspect ratio, golden hour afterglow."
  },
  {
    id: "13",
    title: "Modern Brutalist Architecture",
    prompt: "A striking black and white architectural photograph of a monumental brutalist concrete building, deep vertical concrete fins creating dramatic alternating bands of light and razor-sharp shadow, harsh afternoon sunlight from upper left, visible wood formwork grain texture and tie-hole patterns on the concrete surface, a single tiny human figure in a long coat walking at the base for scale, abstract geometric composition, Tadao Ando influence, high contrast monochromatic treatment. Architectural fine art photography."
  },
  {
    id: "14",
    title: "Fluid Abstract Art",
    prompt: "A mesmerizing fluid abstract artwork, swirling liquid pigments in deep violet, electric cobalt blue, pearl white, and silver, marbled patterns like ink dispersing in water, sweeping diagonal flow from bottom-left to upper-right, bioluminescent silver veins threading through the blue like electrical energy, no hard edges or recognizable forms, pure hypnotic color and motion, designed for large-scale projection. Digital abstract art, high resolution."
  },
  {
    id: "15",
    title: "Clean Product Photography",
    prompt: "A clean premium product photograph of a frosted glass skincare serum bottle with a bamboo dropper cap, golden vitamin C serum visible glowing through the translucent glass, soft studio lighting from above-left creating gentle shadows on a seamless warm white background, the cap slightly unscrewed revealing the glass dropper pipette, minimalist natural skincare aesthetic, luxurious but not clinical. Professional product photography, commercial grade."
  },
  {
    id: "16",
    title: "Botanical Watercolor",
    prompt: "A delicate watercolor botanical illustration, wild roses in dusty pink and lavender sprigs in soft purple arranged in a curved diagonal spray, loose and airy wet-on-wet technique with visible brushstrokes and translucent overlapping washes, sage green stems and leaves connecting the composition, colors fading softly into warm white textured cold-press watercolor paper, a single floating rose petal drifting away, English cottage garden style, hand-painted feel. Watercolor illustration, fine art stationery."
  },
  {
    id: "17",
    title: "Pastry Shop Branding",
    prompt: "A French patisserie branding kit, elegant logo with a croissant silhouette and delicate script typography, warm buttercream and chocolate brown color palette, displayed on a marble surface with a real flaky croissant, a gold foil business card, and a striped pastry box, sophisticated yet inviting, Parisian cafe aesthetic. Brand identity design photography."
  },
  {
    id: "18",
    title: "Dark Mode Dashboard",
    prompt: "A sleek dark mode analytics dashboard UI design, deep charcoal background with soft indigo cards, clean data visualizations with green accent charts and graphs, subtle grid lines, modern sans-serif typography, sidebar navigation with glowing icon indicators, professional enterprise software interface, minimal and data-rich. Web app UI design, dark theme."
  },
  {
    id: "19",
    title: "Street Fashion Editorial",
    prompt: "An editorial street fashion photograph, a model in an oversized beige trench coat and wide-leg trousers walking through a modern urban setting with concrete architecture, golden hour sunlight creating long shadows, shot from behind in profile, the clothing in motion with fabric billowing, cinematic composition, The Row and Lemaire aesthetic, warm earthy tones. Fashion editorial photography."
  },
  {
    id: "20",
    title: "Ceramic Tableware Set",
    prompt: "A handcrafted ceramic tableware set on a rustic wooden dining table, a dinner plate, bowl, and mug in warm speckled stoneware glaze with subtle earth tones of sand and terracotta, organic irregular shapes showing the maker's hand, soft natural sunlight from a nearby window, a linen napkin folded beside the setting, minimalist wabi-sabi dining aesthetic. Product photography, artisan craft."
  },
];

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buffer);
}

async function generateImage(item) {
  console.log(`\n🎨 Generating: ${item.title} (${item.id})...`);

  const body = {
    model: "glm-image",
    prompt: item.prompt,
    n: 1,
    size: "1024x1024",
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error(`  ❌ API error: ${data.error?.message || response.status}`);
    return null;
  }

  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.error("  ❌ No image URL in response:", JSON.stringify(data).slice(0, 200));
    return null;
  }

  const outPath = resolve(OUT_DIR, `${item.id}.png`);
  await downloadImage(imageUrl, outPath);
  console.log(`  ✅ Saved to public/showcase/${item.id}.png`);
  return `/showcase/${item.id}.png`;
}

async function main() {
  console.log("=== DotDraw Showcase Image Generator ===\n");
  console.log(`API Key: ${GLM_API_KEY.slice(0, 10)}...`);
  console.log(`Output: ${OUT_DIR}`);
  console.log(`Items to generate: ${items.length}\n`);

  let success = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const result = await generateImage(item);
      if (result) success++;
      else failed++;
      // Small delay between requests to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done: ${success} success, ${failed} failed ===`);
}

main();
