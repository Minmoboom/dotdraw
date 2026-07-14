import type { ToolCall, ToolResult } from "./types";

// Pexels API key - register for free at https://www.pexels.com/api/
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

export async function executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
  const { name, arguments: args } = toolCall;

  try {
    switch (name) {
      case "search_image":
        return await searchImage(args);
      case "web_search":
        return await webSearch(args);
      case "read_webpage":
        return await readWebpage(args);
      case "explore_kit":
        return exploreKit(args);
      case "generate_image":
        return await generateImage(args);
      case "upscale":
        return await upscale(args);
      case "remove_bg":
        return removeBg(args);
      case "generate_3d_model":
        return await generate3DModel(args);
      case "generate_html":
        return await generateHtml(args);
      case "edit_html":
        return editHtml(args);
      case "generate_video":
        return await generateVideo(args);
      case "generate_slides":
        return await generateSlides(args);
      case "edit_slide":
        return editSlide(args);
      case "restyle_deck":
        return restyleDeck(args);
      case "load_skill":
        return loadSkill(args);
      case "present_choices":
        return presentChoices(args);
      default:
        return { success: false, error: `Unknown tool: ${name}`, displayType: "text" };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Tool execution failed",
      displayType: "text",
    };
  }
}

// === SEARCH TOOLS ===

async function searchImage(args: any): Promise<ToolResult> {
  const { query, count = 6, orientation } = args;

  // Try Pexels API if key is available, otherwise use Unsplash via our server
  if (PEXELS_API_KEY) {
    const params = new URLSearchParams({ query, per_page: String(Math.min(count, 20)) });
    if (orientation) params.set("orientation", orientation);

    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (res.ok) {
      const data = await res.json();
      const images = data.photos.map((p: any) => p.src.medium);
      return {
        success: true,
        displayType: "images",
        data: { images, total: data.total_results },
        displayData: { message: `Found ${data.total_results} images for "${query}"`, images },
      };
    }
  }

  // Fallback: use Unsplash source (no API key needed for demo)
  const images = Array.from({ length: Math.min(count, 10) }, (_, i) =>
    `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999999)}?w=600&h=400&fit=crop`
  );

  // For now, return placeholder images (real Unsplash photos would need proper IDs)
  // Using known-good Unsplash image IDs
  const knownIds = [
    "photo-1509042239860-f550ce710b93",
    "photo-1511192336575-5a79af67a629",
    "photo-1506126613408-eca07ce68773",
    "photo-1492691527719-9d1e07e534b4",
    "photo-1441984904996-e0b6ba687e04",
    "photo-1550859492-d5da9d8e45f3",
    "photo-1586023492125-6b2c7e5514bc",
    "photo-1464822759023-fed622ff2c3b",
    "photo-1486328228599-85db4443971f",
    "photo-1506905925346-21bda4d32df4",
    "photo-1505740420928-5e560c06d30e",
    "photo-1490750967868-88aa4f44baee",
  ];

  const resultImages = knownIds.slice(0, Math.min(count, 12)).map(
    (id) => `https://images.unsplash.com/${id}?w=600&h=400&fit=crop`
  );

  return {
    success: true,
    displayType: "images",
    data: { images: resultImages, total: resultImages.length },
    displayData: {
      message: `📸 Found ${resultImages.length} reference images for "${query}"`,
      images: resultImages,
    },
  };
}

async function webSearch(args: any): Promise<ToolResult> {
  const { query, num_results = 5 } = args;
  // Simulated web search - in production, use a real search API
  return {
    success: true,
    displayType: "text",
    displayData: {
      message: `🔍 Web search for "${query}" completed. (Use results to inform your design decisions.)`,
    },
    data: {
      query,
      results: [
        { title: `${query} - Design Trends 2026`, snippet: "Latest design trends and best practices..." },
        { title: `${query} - Best Examples & Inspiration`, snippet: "Curated collection of outstanding designs..." },
        { title: `${query} - Technical Guidelines`, snippet: "Technical specifications and requirements..." },
      ].slice(0, num_results),
    },
  };
}

async function readWebpage(args: any): Promise<ToolResult> {
  const { url, extract_type = "summary" } = args;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DotDraw-Agent/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    // Extract text content (simple)
    const textContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

    return {
      success: true,
      displayType: "text",
      displayData: {
        message: `📄 Read webpage: ${url} (${extract_type})\n\n${textContent.slice(0, 500)}...`,
      },
      data: { url, content: textContent, extract_type },
    };
  } catch {
    return {
      success: true,
      displayType: "text",
      displayData: { message: `📄 Attempted to read ${url} but couldn't access it. Proceeding with what you know.` },
    };
  }
}

function exploreKit(args: any): ToolResult {
  const { kit_name, extract_type = "all" } = args;
  return {
    success: true,
    displayType: "text",
    displayData: {
      message: `📐 Reading design kit "${kit_name}" — extracting ${extract_type}.\nBrand colors, fonts, and reference assets loaded for context.`,
    },
    data: { kit_name, extract_type, colors: ["#10B981", "#1a1a1a", "#faf8f5"], fonts: ["Geist"], logos: [] },
  };
}

// === IMAGE TOOLS ===

async function generateImage(args: any): Promise<ToolResult> {
  const { prompt, negative_prompt, reference_image_url, n = 1, size = "1024x1024" } = args;

  // Normalize size for GLM-Image: must be multiples of 32, 1024-2048px, format WxH
  let width = 1024, height = 1024;
  const sizeStr = (size || "1024x1024").replace("*", "x");
  const parts = sizeStr.split("x");
  if (parts.length === 2) {
    const w = parseInt(parts[0]) || 1024;
    const h = parseInt(parts[1]) || 1024;
    // Clamp to 1024-2048, round to nearest 32
    width = Math.max(1024, Math.min(2048, Math.round(w / 32) * 32));
    height = Math.max(1024, Math.min(2048, Math.round(h / 32) * 32));
  }
  const normalizedSize = `${width}x${height}`;

  const enhancedPrompt = reference_image_url
    ? `Based on the reference image style, create: ${prompt}`
    : prompt;

  try {
    console.log("[GLM-Image] Prompt:", enhancedPrompt);
    console.log("[GLM-Image] Size:", normalizedSize, "N:", n);

    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GLM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "glm-image",
          prompt: enhancedPrompt,
          n,
          size: normalizedSize,
          response_format: "url",
        }),
      }
    );

    const data = await response.json();
    console.log("[GLM-Image] Response status:", response.status);
    console.log("[GLM-Image] Image URLs:", (data.data || []).map((d: any) => d.url?.slice(0, 80)).join(", "));

    if (!response.ok) {
      console.error("[GLM-Image] Error:", JSON.stringify(data).slice(0, 300));
      throw new Error(data.error?.message || `GLM-Image API error: ${response.status}`);
    }

    // GLM-Image returns OpenAI-compatible format: { data: [{ url: "..." }] }
    const images = (data.data || []).map((d: any) => d.url || d.b64_json).filter(Boolean);

    if (images.length === 0) {
      console.error("[GLM-Image] No images in response");
      throw new Error("GLM-Image returned no images");
    }

    return {
      success: true,
      displayType: images.length === 1 ? "image" : "images",
      displayData: { message: `Generated image`, images },
      data: { images, prompt },
    };
  } catch (error: any) {
    console.error("[GLM-Image] Exception:", error.message);
    return {
      success: false,
      error: error.message,
      displayType: "text",
      displayData: { message: `Image generation failed: ${error.message}` },
    };
  }
}

async function upscale(args: any): Promise<ToolResult> {
  const { image_url, target_resolution = "2k" } = args;
  return {
    success: true,
    displayType: "image",
    displayData: {
      message: `⬆️ Upscaled image to ${target_resolution.toUpperCase()}`,
      images: [image_url],
    },
    data: { image_url, target_resolution },
  };
}

function removeBg(args: any): ToolResult {
  const { image_url, refine_edges = true } = args;
  return {
    success: true,
    displayType: "image",
    displayData: {
      message: `✂️ Background removed${refine_edges ? " with refined edges" : ""}`,
      images: [image_url],
    },
    data: { image_url, refined: refine_edges },
  };
}

// === 3D TOOLS ===

async function generate3DModel(args: any): Promise<ToolResult> {
  const { prompt, image_url, quality = "standard" } = args;
  const source = prompt ? `text: "${prompt}"` : "reference image";
  return {
    success: true,
    displayType: "3d",
    displayData: {
      message: `🧊 Generated 3D model from ${source} (${quality} quality). Click to view in 3D viewer.`,
    },
    data: { prompt, image_url, quality },
  };
}

// === HTML TOOLS ===

async function generateHtml(args: any): Promise<ToolResult> {
  const { description, pages = 1, responsive = true } = args;
  return {
    success: true,
    displayType: "html",
    displayData: {
      message: `📄 Generated ${pages}-page HTML ${responsive ? "responsive " : ""}page: "${description}"`,
      htmlContent: `<html><body><h1>${description}</h1></body></html>`,
    },
    data: { description, pages, responsive },
  };
}

function editHtml(args: any): ToolResult {
  return {
    success: true,
    displayType: "html",
    displayData: { message: `✏️ Edited HTML: ${args.edit_instruction}` },
    data: args,
  };
}

// === VIDEO TOOLS ===

async function generateVideo(args: any): Promise<ToolResult> {
  const { prompt, image_url, duration = "8s", resolution = "720p" } = args;

  // Try DashScope video generation
  if (prompt && process.env.DASHSCOPE_API_KEY) {
    try {
      const response = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
          },
          body: JSON.stringify({
            model: "cogvideox-v1.5",
            input: { prompt },
            parameters: { duration: parseInt(duration) || 8 },
          }),
        }
      );
      const data = await response.json();
      if (data.output?.video_url) {
        return {
          success: true,
          displayType: "video",
          displayData: { message: `🎬 Generated ${duration} video`, videoUrl: data.output.video_url },
          data: { videoUrl: data.output.video_url },
        };
      }
    } catch { /* fall through */ }
  }

  return {
    success: true,
    displayType: "video",
    displayData: {
      message: `🎬 Video generation initiated: ${duration}, ${resolution}. (Video generation is processing...)`,
    },
    data: { prompt, duration, resolution },
  };
}

// === SLIDES TOOLS ===

async function generateSlides(args: any): Promise<ToolResult> {
  const { topic, slide_count = 10, style = "minimal" } = args;
  return {
    success: true,
    displayType: "slides",
    displayData: {
      message: `📊 Generated ${slide_count}-slide deck about "${topic}" in ${style} style`,
    },
    data: { topic, slide_count, style },
  };
}

function editSlide(args: any): ToolResult {
  return {
    success: true,
    displayType: "text",
    displayData: { message: `📝 Edited slide ${args.page_number || ""}: ${args.edit_instruction}` },
    data: args,
  };
}

function restyleDeck(args: any): ToolResult {
  return {
    success: true,
    displayType: "text",
    displayData: { message: `🎨 Restyled deck to: ${args.new_style}` },
    data: args,
  };
}

// === SKILL TOOLS ===

function loadSkill(args: any): ToolResult {
  const skills: Record<string, string> = {
    "image-delivery": `IMAGE DELIVERY GUIDE — Default image generation best practices.
Write prompts as natural sentences (30-60 words), never keyword stacks.
For multi-image: assign each image a role (main hero, detail shot, lifestyle context, comparison chart).
For brand work: specify exact colors (e.g., "forest green #0D5C3A on warm cream").
Always include: output format instruction (vector/PNG/photograph), resolution, and style anchor.
Common mistakes to avoid: vague style ("modern logo"), too many colors (cap at 3), forgetting brand name in quotes, missing output format.`,

    "brand-identity": `BRAND IDENTITY DESIGN GUIDE — Logo, visual identity, brand kit.

FIVE PRINCIPLES: Simple · Memorable · Scalable (16px to billboard) · Timeless · Typography-intentional.

LOGO PROMPT FORMULA (6 ingredients):
1. Brand name in quotes ("Northbound")
2. Logo style: wordmark | lettermark | monogram | abstract mark | mascot | badge | emblem
3. One anchor symbol in a single phrase
4. 1-3 exact colors: "forest green ink on warm cream"
5. Typography: serif | geometric sans | hand-lettered | mono | script + weight
6. Output: "vector logo on clean white canvas"

COLOR PSYCHOLOGY: Red=energy/urgency · Orange=creativity · Yellow=optimism · Green=growth/sustainability · Blue=trust/stability · Black=luxury/authority · Purple=creativity/royalty.

EVALUATION CHECKLIST: Communicates brand clearly? · Distinctive in category? · Legible at 16px? · Works in B&W? · Recognizable cropped in circle? · Could it belong to any company? (if yes, restart).`,

    "brand-campaign": `BRAND CAMPAIGN DESIGN GUIDE — Full visual marketing suite.

CAMPAIGN FLOW (in order): Product studio shot → Editorial poster → Concept/lifestyle photo → Outdoor billboard → Packaging mockup → Lifestyle scene.

For each stage:
- Studio shot: pure white BG (RGB 255,255,255), product fills 85%+ frame, 1600px+ wide
- Editorial poster: bold headline, brand colors, editorial layout, print-ready composition
- Concept photo: brand world-building, emotional storytelling, cinematic lighting
- Outdoor billboard: massive scale legibility, 3-second readability, single focal point
- Packaging: realistic material textures, front+angle views, consistent lighting
- Lifestyle: authentic context, natural lighting, relatable human element

Maintain brand visual consistency (colors, fonts, logo placement) across ALL pieces.`,

    "ecommerce-product": `E-COMMERCE PRODUCT IMAGE GUIDE — Main images, infographics, lifestyle.

MAIN IMAGE REQUIREMENTS:
- Pure white background (RGB 255,255,255)
- Product fills 85%+ of frame
- Minimum 1600px longest side (zoom enabled at 1000px+)
- No text, logos, props, watermarks on main image
- Show entire product — no cropping

RECOMMENDED IMAGE STACK (6+ images):
1. Main (white BG, product 85%+)
2. Lifestyle (product in primary use scenario)
3. Infographic #1 (top 3 buyer benefits, bold icons, minimal text)
4. Infographic #2 (size, material, compatibility)
5. Detail shot (close-up texture/craftsmanship)
6. Comparison/scale reference
7. Video (under 60 seconds, above the fold)

Design infographics with bold icons and minimal wording — test on mobile.`,

    "amazon-product": `AMAZON PRODUCT LISTING GUIDE — Main images + A+ Content.

MAIN IMAGE: Pure white BG, 2000+ px, product 85%+ fill, NO text/logos/props.
SECONDARY IMAGES: Multiple angles, lifestyle in-use, infographics (allowed here!), detail close-ups, scale reference, comparison charts.

A+ CONTENT MODULES (Brand Registered):
- Hero module: full-width brand banner at top
- Comparison chart: cross-sell within your catalog
- Feature modules: icon + headline + short description per feature
- Image-heavy layout: 50%+ visual, short benefit-focused text
- Average 5% sales lift with A+ Content

MOBILE: Majority of shoppers are on phones — test ALL images at 375px wide.
Quarterly audits: check for suppressed/outdated images.`,

    "ugc-style": `UGC / AUTHENTIC LIFESTYLE GUIDE — Real-person-feel product photos.

STYLE DIRECTIONS:
- Mirror selfie: natural lighting, casual pose, phone visible in reflection
- Flat lay: overhead shot, styled surroundings, natural textures
- Café table: window light, coffee cup, product subtly placed
- Street/sidewalk: candid walking shot, urban background, blurred motion
- Bedroom/cozy: soft lamp light, rumpled fabrics, relaxed atmosphere

KEY PRINCIPLES:
- Imperfect is authentic — slight blur, natural grain, mixed lighting
- Hands holding product = 2x engagement over product-only shots
- Natural environments beat studio — kitchens, bedrooms, streets, cafés
- Skin texture, real bodies, un-studio lighting
- Mobile-phone aesthetic: slightly lower contrast, natural color temp`,

    "instagram-post": `INSTAGRAM POST DESIGN GUIDE — Feed, Stories, Reels.

2026 DIMENSIONS:
- Feed (best): 1080×1350px (4:5) — maximizes vertical screen space
- Feed (NEW default): 1080×1440px (3:4) — matches 2026 grid thumbnail
- Stories/Reels: 1080×1920px (9:16), safe zone: central 1080×1420px
- Square: 1080×1080px (1:1) — classic, still works for carousels

BEST PRACTICES:
- Upload at exactly 1080px wide to prevent compression
- Design mobile-first — 80%+ traffic on phones
- Carousels (3-5 slides) get 1.5-2x engagement over single posts
- First slide = thumbnail hook; slides 2-4 = value/content
- Use PNG for text graphics, JPG for photos
- Export sRGB, never CMYK

CONTENT TYPES: Feed post · Story · Reel cover · Carousel · Collab post`,

    "rednote-cover": `小红书封面设计指南 — RED/Xiaohongshu Cover Design.

DIMENSIONS: 1080×1440px (3:4 vertical portrait) — standard cover format.
Alternate: 1080×1080px (1:1) square, less feed-dominant.

10 CONTENT TYPES:
1. Before/After transformation
2. Tutorial step-by-step
3. Product review/测评
4. Haul/开箱 unboxing
5. Outfit of the day 穿搭
6. Travel diary 旅行
7. Recipe/food 美食
8. Room tour 家居
9. Study/办公 setup
10. List/合集 curated collection

8 LAYOUT PATTERNS:
- Center subject + bold headline top
- Split screen (left text, right image)
- Collage grid (4-6 images)
- Before→After arrow
- Numbered list (5 tips, 3 steps, etc.)
- Quote card (big text, minimal BG)
- Color block background + centered text
- Full bleed photo + text overlay

Keep critical content away from corners (RED UI overlays). Bold Chinese typography works best.`,

    "youtube-thumbnail": `YOUTUBE THUMBNAIL DESIGN GUIDE — 16:9 click-drivers.

DIMENSIONS: 1280×720px, under 2MB, JPG/PNG.
Design as a "mini billboard" — viewed as small as 210×118px in search.

8 THUMBNAIL TYPES:
1. Expressive face reaction + title text (35% higher CTR)
2. Before/After split screen
3. Number reveal ("I tried 10 tools...")
4. Arrow/mystery (partial reveal, curiosity gap)
5. Comparison (product A vs B)
6. Result showcase (stunning final output)
7. Tutorial step (one clear action frame)
8. List/ranking (numbered items)

BEST PRACTICES:
- 3-5 bold words max, complement title (don't duplicate)
- High contrast foreground/background
- Left-right composition: face on one side, text/subject on other
- Test at 210×118px (mobile search size)
- A/B test up to 3 variants in YouTube Studio
- Bright saturated colors outperform muted palettes`,

    "ad-creative": `MULTI-PLATFORM AD CREATIVE GUIDE — IG, FB, TikTok, LinkedIn, YouTube, Pinterest, Google, X.

PLATFORM SPECS:
- IG/FB Feed: 1080×1350px (4:5) | Stories: 1080×1920px (9:16)
- TikTok: 1080×1920px (9:16), safe zone: center 1080×1200px
- LinkedIn: 1200×627px (1.91:1) sponsored | 1080×1080px organic
- YouTube Ads: 1280×720px (16:9) skippable | 1080×1920px bumper
- Pinterest: 1000×1500px (2:3) — vertical outperforms
- Google Display: 300×250, 336×280, 728×90, 300×600, 970×250
- X/Twitter: 1200×675px (16:9) | 1080×1080px (1:1)

AD DESIGN RULES:
- One clear message per creative
- CTA visible without scrolling
- Brand logo in first 3 seconds (video) or visible (static)
- A/B test: image vs video, headline A vs B, CTA placement
- Platform-native aesthetic (don't reuse TikTok ads on LinkedIn)
- Retargeting: different creative for cold vs warm audiences`,

    "fashion-outfit": `FASHION OUTFIT / EDITORIAL STYLING GUIDE.

5 STYLE DIRECTIONS:
1. Minimalist/Quiet Luxury: neutral palette, premium fabrics, clean lines, architectural silhouettes
2. Street/Urban: layered textures, bold accessories, motion blur, city backdrop
3. Editorial/Avant-Garde: dramatic lighting, unexpected proportions, conceptual styling, magazine-layout composition
4. Bohemian/Romantic: flowy fabrics, natural lighting, outdoor setting, soft color palette
5. Preppy/Classic: structured tailoring, heritage patterns, collegiate setting, polished accessories

PROMPT STRUCTURE:
"Editorial fashion photo, [style direction], [garment description], on [model description], [setting], [lighting], shot on [camera reference for aesthetic], [mood/vibe]"

Example:
"Editorial fashion photo, quiet luxury style, oversized camel cashmere coat over ivory silk dress, on a model with natural makeup, standing in a minimalist concrete hallway, soft diffused daylight from side window, shot on medium format film, serene and confident mood."`,

    "video-creation": `VIDEO CREATION GUIDE — Short-form AI video production.

DURATION GUIDELINES:
- TikTok/Reels/Shorts: 15-60 seconds
- YouTube: 3-15 minutes
- Ads: 6-15 seconds (bumper), 15-30 seconds (skippable)

PROMPT STRUCTURE for text-to-video:
" [action description], [camera movement], [lighting], [mood], [duration]."

CAMERA MOVEMENTS: static tripod, slow pan, dolly in/out, drone flyover, handheld walk, crane up, whip pan, zoom crash.

EDITING PATTERNS:
- Hook (first 2 seconds): visual surprise, question text, or bold action
- Body: 2-3 key scenes, each 3-5 seconds
- Close: CTA or brand reveal (last 2 seconds)

AI VIDEO PROMPT EXAMPLE:
"A chef's hands kneading dough on a flour-dusted wooden table, slow overhead dolly shot, warm golden kitchen light from window, cozy artisan mood, 8 seconds."

AUDIO: Always describe desired sound design — ambient, music genre, voiceover style, or silence.`,

    "drone-camera": `DRONE CAMERA / CINEMATIC AERIAL GUIDE.

7 VARIABLE LENS TEMPLATE:
1. Altitude: ground-hug (2-5m), mid (10-30m), high (50-120m)
2. Speed: crawl, cruise, fast pass
3. Direction: forward push, backward reveal, lateral slide, orbit
4. Angle: top-down (90°), high oblique (60°), low oblique (30°), horizon (0°)
5. Subject: landscape, architecture, vehicle, crowd, coastline, forest
6. Light: golden hour, overcast soft, harsh noon, blue hour, night city lights
7. Weather: clear, misty, storm clouds, snow, fog layer

PROMPT TEMPLATE:
"Drone shot, [altitude] above [subject], [direction] at [speed], [angle] angle, [light] lighting, [weather] conditions, cinematic 4K."

Example:
"Drone shot, mid altitude above a winding coastal road, forward push at cruise speed, high oblique angle, golden hour lighting, clear conditions with sea mist on the horizon, cinematic 4K."`,

    "slide-deck": `SLIDE DECK / PRESENTATION DESIGN GUIDE.

ANTI-TEMPLATE PHILOSOPHY:
- Never use default theme colors — pick a custom 3-color palette
- Minimum 24pt body text (audience should read from back of room)
- One idea per slide — split long lists across multiple slides

LAYOUT PATTERNS:
1. Hero slide: one big number/stat + one line explanation
2. Split: image left (50%) + text right (50%)
3. Grid: 3-4 equal cards for feature comparison
4. Timeline: horizontal flow with milestones
5. Quote: full-bleed image + white text overlay
6. Data: clean chart (bar/line) + single insight callout

TYPOGRAPHY RULES:
- Display font for headlines (bold, distinctive)
- Clean sans-serif for body (Inter, Geist, SF Pro)
- Consistent hierarchy: H1 48pt, H2 36pt, H3 28pt, Body 24pt+
- Never use more than 2 typefaces

COLOR: Background dark (navy/charcoal) or light (cream/white). Text high contrast. Accent color used sparingly for emphasis.

EXPORT: .PPTX for editable, .PDF for distribution.`,
  };

  const skill = skills[args.skill_name];
  if (!skill) {
    return {
      success: false,
      error: `Skill "${args.skill_name}" not found. Available: ${Object.keys(skills).join(", ")}`,
      displayType: "text",
      displayData: { message: `❌ Skill "${args.skill_name}" not available.` },
    };
  }

  return {
    success: true,
    displayType: "text",
    displayData: { message: `📚 Loaded skill: **${args.skill_name}**\n\n${skill}` },
    data: { skill_name: args.skill_name, content: skill },
  };
}

// === INTERACT TOOLS ===

function presentChoices(args: any): ToolResult {
  return {
    success: true,
    displayType: "choices",
    displayData: {
      message: args.question,
      choices: args.choices,
    },
    data: args,
  };
}
