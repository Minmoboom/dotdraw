import { ALL_TOOLS, TOOL_NAMES } from "../tools/registry";
import { executeToolCall } from "../tools/implement";
import type { ToolCall, ToolResult, ChatMessage } from "../tools/types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

interface AgentResponse {
  messages: ChatMessage[];
  toolCalls: ToolCall[];
  finalContent: string;
}

export async function runAgent(
  userMessage: string,
  history: ChatMessage[] = [],
  skill?: string | null
): Promise<AgentResponse> {
  const messages: any[] = [];
  const toolCalls: ToolCall[] = [];

  // System prompt
  messages.push({
    role: "system",
    content: `你是 Domi，一个自主 AI 设计代理。你的任务是根据用户需求，选择合适的工具来完成设计工作。

## 🔧 工具调用决策规则

### 规则 1：先搜索，后生成
- 当用户需求涉及**具体风格、品牌或趋势**时，先调用 search_image 找参考图
- 当用户需求涉及**最新信息、品牌背景、行业规范**时，先调用 web_search
- **只有简单明确的需求**才可以直接生成

### 规则 2：按需加载 skill
- 检测到以下关键词时，自动加载对应 skill：
  - logo/标志/品牌 → load_skill("brand-identity")
  - 电商/产品图/亚马逊 → load_skill("ecommerce-product") 或 load_skill("amazon-product")
  - Instagram/帖子 → load_skill("instagram-post")
  - 小红书 → load_skill("rednote-cover")
  - YouTube/缩略图 → load_skill("youtube-thumbnail")
  - 视频/动画 → load_skill("video-creation")
  - 穿搭/时尚 → load_skill("fashion-outfit")
  - PPT/幻灯片/演示 → load_skill("slide-deck")
  - 广告/投放 → load_skill("ad-creative")
  - 种草/UGC → load_skill("ugc-style")
  - 无人机/航拍 → load_skill("drone-camera")
  - 品牌全案/营销 → load_skill("brand-campaign")
  - 任何生图需求 → 先加载 load_skill("image-delivery")
- **skill 必须先加载，再调用生成工具**

### 规则 3：工具选择决策树
| 用户说了什么 | 用什么工具 |
|------------|-----------|
| "生成/设计/画/做 一个 logo/标志/图标" | load_skill("brand-identity") → generate_image |
| "生成/设计/做 一张海报" | load_skill("image-delivery") → generate_image |
| "生成/设计 产品图/电商图" | load_skill("ecommerce-product") → generate_image |
| "生成一个网页/页面/落地页" | load_skill("image-delivery") → generate_html |
| "修改这个网页" | edit_html |
| "生成视频" | load_skill("video-creation") → generate_video |
| "做 PPT/幻灯片" | load_skill("slide-deck") → generate_slides |
| "修改第X页幻灯片" | edit_slide |
| "换个主题风格" | restyle_deck |
| "生成 3D 模型" | generate_3d_model |
| "放大/提高分辨率" | upscale |
| "去背景/抠图" | remove_bg |
| "参考/灵感/找图" | search_image |
| "搜索/查一下/最新" | web_search |
| "分析这个网站" | read_webpage |
| 有多个选项需要用户决定 | present_choices |

### 规则 4：组合工具
- 一次回复可以连续调用多个工具，但要**按依赖顺序**
- 正确顺序：skill → search → generate
- 返回结果后，用自然语言向用户解释设计思路

### 规则 5：不要做什么
- ❌ 不要跳过 skill 直接生成复杂设计
- ❌ 不要同时调用同类工具（如两次 generate_image）
- ❌ 不要在没有用户要求时生成内容
- ❌ 不要编造工具返回的结果

### 规则 6：错误处理
- 如果工具返回失败，自动重试一次（最多一次）
- 如果重试仍失败，告诉用户遇到了什么问题，并提出替代方案`,

  });

  // Add history
  for (const msg of history.slice(-20)) {
    messages.push({
      role: msg.role,
      content: msg.content,
      ...(msg.toolCallId ? { tool_call_id: msg.toolCallId } : {}),
    });
  }

  // If a skill is selected, inject instruction first
  if (skill) {
    messages.push({
      role: "user",
      content: `[System: Before processing the next message, load this skill first: ${skill}. Then apply its guidelines.]`,
    });
  }

  // Add current user message
  messages.push({ role: "user", content: userMessage });

  // Agent loop (max 5 tool-calling rounds)
  for (let round = 0; round < 5; round++) {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: ALL_TOOLS.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        })),
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Agent API error:", err);
      // Fallback: respond without tool calling
      return {
        messages: [{ role: "assistant", content: "I understand your request. Let me help you with that." }],
        toolCalls,
        finalContent: "I understand your request. Let me help you with that.",
      };
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const msg = choice?.message;

    if (!msg) {
      return { messages: [{ role: "assistant", content: "I'm having trouble processing this. Could you try again?" }], toolCalls, finalContent: "" };
    }

    // Add assistant message to conversation
    messages.push(msg);

    // Check for tool calls
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      // Execute all tool calls
      for (const tc of msg.tool_calls) {
        const toolCall: ToolCall = {
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments || "{}"),
          status: "running",
        };
        toolCalls.push(toolCall);

        // Execute
        const result: ToolResult = await executeToolCall(toolCall);
        toolCall.result = result;
        toolCall.status = result.success ? "completed" : "failed";

        // Add tool result to messages
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result.success ? result.data || result.displayData?.message || "Done" : { error: result.error }),
        });
      }
      // Continue loop — LLM will process tool results
      continue;
    }

    // No tool calls — this is the final response
    const content = msg.content || "";
    const finalMessages: ChatMessage[] = [{ role: "assistant", content }];

    return { messages: finalMessages, toolCalls, finalContent: content };
  }

  // Max rounds reached
  return {
    messages: [{ role: "assistant", content: "I've gathered what I need. Here's a summary of my findings." }],
    toolCalls,
    finalContent: "Done.",
  };
}
