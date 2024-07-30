import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';
import { Client } from "@gradio/client";

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function POST(req) {
  const { message, model } = await req.json();

  if (model === 'suntomoon/Mistral-Large-Instruct-2407') {
    try {
      const client = await Client.connect("suntomoon/Mistral-Large-Instruct-2407", { hf_token: process.env.HUGGING_FACE_API_KEY });
      const result = await client.predict("/chat", { 		
        message: message, 		
        system_message: message, 		
        max_tokens: 4000, 		
        temperature: 0.1, 		
        top_p: 0.1, 
      });

      const reply = result.data;
      return new Response(JSON.stringify({ reply }), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ message: 'Error communicating with Gradio AI service' }), { status: 500 });
    }
  } else {
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=5, max=1000',
    });

    const response = hf.textGenerationStream({
      model: model,
      inputs: message,
      parameters: { max_new_tokens: 4000 },
    });

    const stream = HuggingFaceStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream, { headers });
  }
}