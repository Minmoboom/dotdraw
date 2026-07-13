import { ALL_TOOLS, TOOL_NAMES } from "../tools/registry";
import { executeToolCall } from "../tools/implement";
import type { ToolCall, ToolResult } from "../tools/types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

export interface AgentEvent {
  type: "thinking" | "tool_call" | "tool_result" | "text" | "done" | "error";
  content?: string;
  name?: string;
  displayName?: string;
  status?: "running" | "completed" | "failed";
  images?: string[];
  videoUrl?: string;
  htmlContent?: string;
}

export async function* runAgentStream(
  userMessage: string,
  skill?: string | null
): AsyncGenerator<AgentEvent> {
  const messages: any[] = [];

  // System prompt
  messages.push({
    role: "system",
    content: `你是 Domi，自主 AI 设计代理。

## 必须遵守的规则

### 规则1：静默加载 skill — 这是最重要的规则！
⚠️ 你在调用 load_skill 时，回复内容中**绝对不能出现以下词语**：
- "加载" / "load" / "skill" / "技能" / "playbook" / "指南" / "手册" / "我先"
- **任何暗示你正在使用工具的文字都不允许**

正确做法：调用 load_skill 工具，但你的回复只讨论设计本身，就像你天生就会一样。
错误示例：❌ "我先加载小红书封面设计技能" ❌ "让我加载一下skill"
正确示例：✅ "好的，我来设计这个封面" ✅ "这个标题很有吸引力"

- 小红书/封面 → load_skill("rednote-cover")
- logo/标志 → load_skill("brand-identity")
- 海报 → load_skill("image-delivery")
- 产品图/电商 → load_skill("ecommerce-product")
- Instagram → load_skill("instagram-post")
- YouTube缩略图 → load_skill("youtube-thumbnail")
- 视频 → load_skill("video-creation")
- PPT → load_skill("slide-deck")

### 规则2：图片尺寸
generate_image 的 size 用 WxH 格式，值必须是32的倍数，范围1024-2048。常用："1024x1024"、"1280x1280"、"1024x1536"（竖版）

### 规则3：回复风格
- 用自然中文对话，像设计师跟客户聊天一样
- 不要用 markdown 格式（不要 **、不要表格、不要 ##）
- 不要列"设计分析""设计策略"等标题
- 简单一句话告诉用户你做了什么就行，不需要长篇解释
- 生成完直接展示图片，简短说明即可

### 规则4：图片 prompt 原则
- generate_image 的 prompt 直接用用户的中文描述，原封不动传递，不要翻译成英文
- 如果用户描述很长，适当精简但保留所有关键视觉元素
- **不要把具体中文文字写进 prompt**（AI 生图会生成乱码/错别字）
- 描述视觉风格、配色、构图即可，文字类内容后续可以用其他工具叠加

### 规则5：不要重复失败
如果 generate_image 失败，检查 size 是否正确，最多重试 1 次。`,
  });

  // Inject skill instruction if selected
  if (skill) {
    messages.push({
      role: "user",
      content: `[请先加载这个 skill: ${skill}]`,
    });
  }

  messages.push({ role: "user", content: userMessage });

  // Agent loop (max 5 rounds)
  for (let round = 0; round < 5; round++) {
    // Emit thinking event
    yield { type: "thinking", content: "Thinking" };

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
          function: { name: t.name, description: t.description, parameters: t.parameters },
        })),
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      yield { type: "error", content: "Model API error" };
      return;
    }

    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) {
      yield { type: "error", content: "No response from model" };
      return;
    }

    messages.push(msg);

    // Check for tool calls
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      // Show LLM reasoning/analysis text (e.g. "好的，这是一个知识教程领域...")
      if (msg.content) {
        yield { type: "text", content: msg.content };
      }

      for (const tc of msg.tool_calls) {
        const toolName = tc.function.name;
        const displayName = TOOL_NAMES[toolName] || toolName;
        const args = JSON.parse(tc.function.arguments || "{}");

        // Emit tool call starting
        yield { type: "tool_call", name: toolName, displayName, status: "running" };

        // Execute
        const result: ToolResult = await executeToolCall({
          id: tc.id,
          name: toolName,
          arguments: args,
          status: "running",
        });

        // Emit tool result
        yield {
          type: "tool_result",
          name: toolName,
          displayName,
          status: result.success ? "completed" : "failed",
          content: result.displayData?.message,
          images: result.displayData?.images,
          videoUrl: result.displayData?.videoUrl,
          htmlContent: result.displayData?.htmlContent,
        };

        // Add tool result to conversation
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result.success ? (result.data || "Done") : { error: result.error }),
        });
      }
      // Continue loop for next thinking round
      continue;
    }

    // No tool calls — final text response
    if (msg.content) {
      // Check if this is the final message (no more tool calls expected)
      yield { type: "text", content: msg.content };
    }
    yield { type: "done" };
    return;
  }

  yield { type: "done" };
}
