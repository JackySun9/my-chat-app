import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function POST(req) {
  const { message, model } = await req.json();

  // Start the streaming response from Hugging Face
  const response = hf.textGenerationStream({
    model: model, // Use the model from the request body
    inputs: message,
    parameters: { max_new_tokens: 2000 },
  });
  
  // Convert the response into a friendly text stream
  const stream = HuggingFaceStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
