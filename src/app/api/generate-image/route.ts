import { NextRequest, NextResponse } from "next/server";

const DASHSCOPE_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";

async function generateWithDashScope(
  prompt: string
): Promise<string> {
  const response = await fetch(DASHSCOPE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model: "wanx2.1-t2i-turbo",
      input: {
        prompt: `专业高品质设计：${prompt}。构图干净，现代美学，专业配色。`,
      },
      parameters: {
        size: "1024*1024",
        n: 1,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || data?.code || `HTTP ${response.status}`;
    throw new Error(message);
  }

  // Check if async task
  if (data.output?.task_id) {
    return await pollTask(data.output.task_id);
  }

  // Sync response
  const url = data.output?.results?.[0]?.url;
  if (!url) throw new Error("No image URL in response");
  return url;
}

async function pollTask(taskId: string, maxRetries = 30): Promise<string> {
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 2000)); // Wait 2s between polls

    const response = await fetch(taskUrl, {
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
      },
    });

    const data = await response.json();

    if (data.output?.task_status === "SUCCEEDED") {
      const url = data.output?.results?.[0]?.url;
      if (!url) throw new Error("Task completed but no image URL");
      return url;
    }

    if (data.output?.task_status === "FAILED") {
      throw new Error(data.message || "Task failed");
    }

    // Still running, continue polling
  }

  throw new Error("Image generation timed out. Please try again.");
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const imageUrl = await generateWithDashScope(prompt);

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
