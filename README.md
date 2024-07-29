# Next.js Chatbot Project

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Chatbot Implementation

This project includes a chatbot that fetches responses from an AI model using streaming. The chatbot processes and displays the responses in real-time.

### API Route

The API route in `app/api/chat/route.js` handles streaming responses from the AI model.

### Client-Side Chatbot Component

The client-side chatbot component located in `app/components/Chat.js` handles user input and displays the AI responses. The responses are streamed and concatenated into a human-readable format in real-time.

### Environment Variables

Make sure to add your Hugging Face API key and the API URL to the environment variables by creating a `.env.local` file in the root of your project:

```env
HUGGING_FACE_API_KEY=hf_xxxxxx
NEXT_PUBLIC_API_URL=http://localhost:3000/api/chat
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
```
