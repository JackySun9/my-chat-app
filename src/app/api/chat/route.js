import { HfInference } from '@huggingface/inference';

export const runtime = "edge";

export async function POST(req) {
  const { message } = await req.json();

  const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-Nemo-Instruct-2407',
    inputs: message,
    parameters: { max_new_tokens: 2000 },
  });

  return new Response(JSON.stringify({ response: response.generated_text }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
