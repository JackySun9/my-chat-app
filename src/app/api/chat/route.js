import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function POST(req) {
  const { message, model } = await req.json();

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const response = hf.textGenerationStream({
    model: model,
    inputs: message,
    parameters: { max_new_tokens: 4000 },
  });

  const stream = HuggingFaceStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
