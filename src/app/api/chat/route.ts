import { NextRequest } from "next/server";
import { runAgentStream } from "@/lib/agent/loop-stream";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, skill } = body;

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: any) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          isClosed = true;
        }
      };

      try {
        for await (const event of runAgentStream(message, skill as string | null)) {
          send(event);
          if (event.type === "done" || event.type === "error") break;
        }
        controller.close();
      } catch (e: any) {
        send({ type: "error", content: e.message || "Agent failed" });
        controller.close();
      }
    },
    cancel() {
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
