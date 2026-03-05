'use server';
/**
 * @fileOverview Provides a Genkit flow for an AI chatbot that answers questions about the Al-Melha Association.
 *
 * - chatbotAnswerQuestions - A function that handles the AI chatbot's response to a natural language question.
 * - ChatbotAnswerQuestionsInput - The input type for the chatbotAnswerQuestions function.
 * - ChatbotAnswerQuestionsOutput - The return type for the chatbotAnswerQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

// Input Schema
const ChatbotAnswerQuestionsInputSchema = z.object({
  question: z.string().describe("The user's natural language question about the Al-Melha Association."),
});
export type ChatbotAnswerQuestionsInput = z.infer<typeof ChatbotAnswerQuestionsInputSchema>;

// Output Schema
const ChatbotAnswerQuestionsOutputSchema = z.object({
  answer: z.string().describe("The AI chatbot's answer to the user's question."),
});
export type ChatbotAnswerQuestionsOutput = z.infer<typeof ChatbotAnswerQuestionsOutputSchema>;

/**
 * Tool to fetch recent projects
 */
const getProjects = ai.defineTool(
  {
    name: 'getProjects',
    description: 'Fetches the list of community projects currently managed by the Al-Melha Association.',
    inputSchema: z.void(),
    outputSchema: z.array(z.object({
      title: z.string(),
      status: z.string(),
      description: z.string(),
    })),
  },
  async () => {
    const { firestore } = initializeFirebase();
    const q = query(collection(firestore, 'projects'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      title: doc.data().title || 'Untitled Project',
      status: doc.data().status || 'Unknown',
      description: doc.data().description || 'No description available.',
    }));
  }
);

/**
 * Tool to fetch upcoming events
 */
const getEvents = ai.defineTool(
  {
    name: 'getEvents',
    description: 'Fetches upcoming events and activities organized by the association.',
    inputSchema: z.void(),
    outputSchema: z.array(z.object({
      title: z.string(),
      location: z.string(),
      status: z.string(),
    })),
  },
  async () => {
    const { firestore } = initializeFirebase();
    const q = query(collection(firestore, 'events'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      title: doc.data().title || 'Untitled Event',
      location: doc.data().location || 'TBD',
      status: doc.data().status || 'Upcoming',
    }));
  }
);

/**
 * Tool to fetch announcements
 */
const getAnnouncements = ai.defineTool(
  {
    name: 'getAnnouncements',
    description: 'Fetches recent important announcements or updates from the association.',
    inputSchema: z.void(),
    outputSchema: z.array(z.object({
      title: z.string(),
      content: z.string(),
    })),
  },
  async () => {
    const { firestore } = initializeFirebase();
    const q = query(collection(firestore, 'announcements'), orderBy('publishDate', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      title: doc.data().title || 'Announcement',
      content: doc.data().content || 'No content provided.',
    }));
  }
);

// Define the prompt with tools
const chatbotAnswerQuestionsPrompt = ai.definePrompt({
  name: 'chatbotAnswerQuestionsPrompt',
  input: { schema: ChatbotAnswerQuestionsInputSchema },
  output: { schema: ChatbotAnswerQuestionsOutputSchema },
  tools: [getProjects, getEvents, getAnnouncements],
  system: `You are a helpful AI assistant for the Al-Melha Association. Your role is to provide accurate, concise, and friendly answers.
  
  Use the provided tools to fetch real-time information about projects, events, and announcements if the user's question requires it.
  
  The Al-Melha Association focuses on:
  - **Events:** Upcoming activities and community engagement.
  - **Membership:** Benefits and how to join.
  - **Projects:** Strategic initiatives for community development.
  - **Financial Transparency:** Open reporting for all members.

  If tools return no data, explain that there are currently no items listed in that category.
  Respond in the same language as the user's question (Arabic or English).`,
  prompt: `User Question: {{{question}}}`,
});

// Define the flow
const chatbotAnswerQuestionsFlow = ai.defineFlow(
  {
    name: 'chatbotAnswerQuestionsFlow',
    inputSchema: ChatbotAnswerQuestionsInputSchema,
    outputSchema: ChatbotAnswerQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await chatbotAnswerQuestionsPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);

// Exported wrapper function
export async function chatbotAnswerQuestions(
  input: ChatbotAnswerQuestionsInput
): Promise<ChatbotAnswerQuestionsOutput> {
  return chatbotAnswerQuestionsFlow(input);
}
