import { Client } from "@gradio/client";

async function testGradio() {
  try {
    const client = await Client.connect("samersan/mistralai-Mistral-Large-Instruct-2407");
    const result = await client.predict("/predict", { 		
      param_0: "Hello!!", 
    });

    console.log(result.data);
  } catch (error) {
    console.error('Gradio API Error:', error);
  }
}

testGradio();