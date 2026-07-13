export type ToolCallStatus = "pending" | "running" | "completed" | "failed";

export interface ToolDefinition {
  name: string;
  description: string;
  category: "search" | "image" | "3d" | "html" | "video" | "slides" | "skill" | "interact";
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status: ToolCallStatus;
  result?: ToolResult;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  displayType: "image" | "images" | "text" | "html" | "video" | "3d" | "choices" | "slides" | "none";
  displayData?: ToolDisplayData;
}

export interface ToolDisplayData {
  message: string;
  images?: string[];
  videoUrl?: string;
  modelUrl?: string;
  htmlContent?: string;
  choices?: ChoiceOption[];
  fileUrl?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}
