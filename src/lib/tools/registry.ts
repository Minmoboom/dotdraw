import type { ToolDefinition } from "./types";

export const ALL_TOOLS: ToolDefinition[] = [
  // === SEARCH ===
  {
    name: "search_image",
    description: "搜索参考图片 — 从库存照片、网络图片、设计模板中查找灵感。当你需要找参考图、风格参考或素材时调用。",
    category: "search",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词，中英文均可，例如 'minimalist coffee logo' 或 '简约咖啡标志'" },
        count: { type: "integer", description: "返回图片数量，默认 6，最多 20" },
        orientation: { type: "string", enum: ["landscape", "portrait", "square"], description: "图片方向偏好" },
      },
      required: ["query"],
    },
  },
  {
    name: "web_search",
    description: "从互联网搜索实时信息（品牌趋势、设计规范、竞品分析等）。当你需要最新信息或事实核查时使用。",
    category: "search",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索查询词" },
        num_results: { type: "integer", description: "返回结果数量，默认 5" },
      },
      required: ["query"],
    },
  },
  {
    name: "read_webpage",
    description: "深度阅读并提取网页内容。当需要分析某个网站的设计风格或获取详细资料时使用。",
    category: "search",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "要阅读的网页 URL" },
        extract_type: { type: "string", enum: ["full", "summary", "design_analysis"], description: "提取类型：全文/摘要/设计分析" },
      },
      required: ["url"],
    },
  },
  {
    name: "explore_kit",
    description: "读取用户 @ 的品牌设计套件（Kit），提取颜色方案、字体、Logo、参考图等品牌资产。",
    category: "search",
    parameters: {
      type: "object",
      properties: {
        kit_name: { type: "string", description: "品牌套件名称" },
        extract_type: { type: "string", enum: ["colors", "fonts", "logos", "all"], description: "提取内容类型" },
      },
      required: ["kit_name"],
    },
  },

  // === IMAGE ===
  {
    name: "generate_image",
    description: "使用 AI 生成图片。支持文生图（text-to-image）和图生图（image-to-image），可融合多张参考图。",
    category: "image",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "图片描述 prompt" },
        negative_prompt: { type: "string", description: "负面提示词，排除不想出现的内容" },
        reference_image_url: { type: "string", description: "参考图 URL（图生图模式）" },
        n: { type: "integer", description: "生成数量：1, 2, 或 4" },
        size: { type: "string", description: "图片尺寸，如 1024*1024" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "upscale",
    description: "将图片放大至更高分辨率（2K 或 4K）。适用于需要高清输出的场景。",
    category: "image",
    parameters: {
      type: "object",
      properties: {
        image_url: { type: "string", description: "要放大的图片 URL" },
        target_resolution: { type: "string", enum: ["2k", "4k"], description: "目标分辨率" },
      },
      required: ["image_url", "target_resolution"],
    },
  },
  {
    name: "remove_bg",
    description: "去除图片背景，生成透明 PNG。适用于产品图、Logo、人物抠图等。",
    category: "image",
    parameters: {
      type: "object",
      properties: {
        image_url: { type: "string", description: "要处理的图片 URL" },
        refine_edges: { type: "boolean", description: "是否精细边缘处理" },
      },
      required: ["image_url"],
    },
  },

  // === 3D ===
  {
    name: "generate_3d_model",
    description: "生成 3D 模型。支持单图转 3D、多视角转 3D、或纯文字描述生成 3D。",
    category: "3d",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "3D 模型描述（文字生成模式）" },
        image_url: { type: "string", description: "参考图 URL（图生 3D 模式）" },
        quality: { type: "string", enum: ["standard", "detailed"], description: "生成质量" },
      },
      required: [],
    },
  },

  // === HTML ===
  {
    name: "generate_html",
    description: "生成完整的 HTML 网页/海报。支持单页或多个页面的静态站点。适用于落地页、产品页、活动海报等。",
    category: "html",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string", description: "网页描述，包括布局、内容、风格要求" },
        pages: { type: "integer", description: "页面数量，默认 1" },
        responsive: { type: "boolean", description: "是否需要响应式设计" },
      },
      required: ["description"],
    },
  },
  {
    name: "edit_html",
    description: "精确编辑已有的 HTML 页面，只修改你指定的部分，保留其余内容不变。",
    category: "html",
    parameters: {
      type: "object",
      properties: {
        html_content: { type: "string", description: "原始 HTML 内容" },
        edit_instruction: { type: "string", description: "编辑指令，描述要修改什么" },
      },
      required: ["html_content", "edit_instruction"],
    },
  },

  // === VIDEO ===
  {
    name: "generate_video",
    description: "生成短视频（4-15 秒），支持文生视频（text-to-video）和图生视频（image-to-video）。",
    category: "video",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "视频描述" },
        image_url: { type: "string", description: "起始图片 URL（图生视频模式）" },
        duration: { type: "string", description: "时长，如 5s, 8s, 10s" },
        resolution: { type: "string", enum: ["480p", "720p"], description: "视频分辨率" },
      },
      required: [],
    },
  },

  // === SLIDES ===
  {
    name: "generate_slides",
    description: "生成多页演示文稿/PPT。支持导出 .pptx 和 .pdf 格式。适用于提案、汇报、教学材料。",
    category: "slides",
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string", description: "演示主题" },
        slide_count: { type: "integer", description: "幻灯片页数" },
        style: { type: "string", description: "风格描述，如 'minimal', 'corporate', 'creative'" },
      },
      required: ["topic", "slide_count"],
    },
  },
  {
    name: "edit_slide",
    description: "修改演示文稿中的单页或多页内容，保留其余页面不变。",
    category: "slides",
    parameters: {
      type: "object",
      properties: {
        slide_content: { type: "string", description: "当前幻灯片内容" },
        edit_instruction: { type: "string", description: "要修改什么" },
        page_number: { type: "integer", description: "要修改的页码" },
      },
      required: ["edit_instruction"],
    },
  },
  {
    name: "restyle_deck",
    description: "全局更换演示文稿的主题风格（颜色/字体/氛围），文字内容保持不变。",
    category: "slides",
    parameters: {
      type: "object",
      properties: {
        deck_content: { type: "string", description: "当前演示文稿内容" },
        new_style: { type: "string", description: "新风格描述" },
      },
      required: ["new_style"],
    },
  },

  // === SKILL ===
  {
    name: "load_skill",
    description: "加载专项设计指南 Skill。包括品牌标识设计、电商产品图、Instagram 帖子、视频创作、PPT 设计等领域的专业指导。",
    category: "skill",
    parameters: {
      type: "object",
      properties: {
        skill_name: {
          type: "string",
          enum: ["image-delivery", "brand-identity", "brand-campaign", "ecommerce-product", "amazon-product", "ugc-style", "instagram-post", "rednote-cover", "youtube-thumbnail", "ad-creative", "fashion-outfit", "video-creation", "drone-camera", "slide-deck"],
          description: "Skill名称: image-delivery(通用生图), brand-identity(品牌标识), brand-campaign(品牌营销全案), ecommerce-product(电商产品图), amazon-product(亚马逊图片), ugc-style(种草UGC), instagram-post(Instagram), rednote-cover(小红书封面), youtube-thumbnail(YouTube缩略图), ad-creative(广告素材), fashion-outfit(穿搭造型), video-creation(视频创作), drone-camera(无人机运镜), slide-deck(演示文稿)"
        },
      },
      required: ["skill_name"],
    },
  },

  // === INTERACT ===
  {
    name: "present_choices",
    description: "当需要用户做出选择时，展示可点击的选项卡片。用户点击后继续执行。",
    category: "interact",
    parameters: {
      type: "object",
      properties: {
        question: { type: "string", description: "向用户提出的问题" },
        choices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              description: { type: "string" },
            },
          },
          description: "选项列表",
        },
      },
      required: ["question", "choices"],
    },
  },
];

// Tool display names for the UI
export const TOOL_NAMES: Record<string, string> = {
  search_image: "Searching images",
  web_search: "Searching the web",
  read_webpage: "Reading webpage",
  explore_kit: "Reading design kit",
  generate_image: "Generating image",
  upscale: "Upscaling image",
  remove_bg: "Removing background",
  generate_3d_model: "Creating 3D model",
  generate_html: "Building webpage",
  edit_html: "Editing webpage",
  generate_video: "Creating video",
  generate_slides: "Creating slides",
  edit_slide: "Editing slide",
  restyle_deck: "Restyling deck",
  load_skill: "Loading playbook",
  present_choices: "Waiting for choice",
};
