import axios from 'axios';
import logger from '../utils/logger';

interface IAMTokenResponse {
  access_token: string;
  expiration: number;
}

interface WatsonxPreferences {
  terrain: string[];
  activities: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  durationDays: number;
  departureMonth?: number;
}

interface TourContext {
  id: string;
  title: string;
  destination: string;
  tags: string[];
  price: number;
  durationDays: number;
  difficulty: string;
  ratingsAverage: number;
}

interface WatsonxRecommendations {
  narrative: string;
  tourIds: string[];
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getIAMToken(): Promise<string> {
  if (cachedToken && Date.now() / 1000 < tokenExpiry - 60) {
    return cachedToken;
  }

  const apiKey = process.env.WATSONX_API_KEY;
  if (!apiKey) throw new Error('Missing WATSONX_API_KEY environment variable');

  const response = await axios.post<IAMTokenResponse>(
    'https://iam.cloud.ibm.com/identity/token',
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10_000 },
  );

  cachedToken = response.data.access_token;
  tokenExpiry = response.data.expiration;
  return cachedToken;
}

export async function generateTravelRecommendations(
  preferences: WatsonxPreferences,
  tourContext: TourContext[],
): Promise<WatsonxRecommendations> {
  const projectId = process.env.WATSONX_PROJECT_ID;
  const modelId = process.env.WATSONX_MODEL_ID ?? 'ibm/granite-13b-chat-v2';
  const baseUrl = process.env.WATSONX_URL ?? 'https://us-south.ml.cloud.ibm.com';

  if (!projectId) throw new Error('Missing WATSONX_PROJECT_ID environment variable');

  const token = await getIAMToken();

  const systemPrompt = `You are an expert travel advisor for IBM Consulting Advantage — WanderWorld's AI-powered travel planning service. 
Your role is to recommend personalised tours from the provided catalogue based on traveler preferences.
Always respond with a JSON object containing:
- "narrative": a warm, engaging 2-3 sentence personalised recommendation paragraph
- "tourIds": an array of tour IDs (strings) from the catalogue, ordered by best match, maximum 6 tours

Respond ONLY with valid JSON. Do not include any other text.`;

  const tourCatalogueText = tourContext
    .map((t) =>
      `ID: ${t.id} | ${t.title} | ${t.destination} | Tags: ${t.tags.join(', ')} | $${t.price} | ${t.durationDays} days | ${t.difficulty} | Rating: ${t.ratingsAverage}`,
    )
    .join('\n');

  const userPrompt = `Traveler Preferences:
- Terrain: ${preferences.terrain.join(', ') || 'any'}
- Activities: ${preferences.activities.join(', ') || 'any'}
- Budget: ${preferences.budget}
- Travel Style: ${preferences.travelStyle}
- Group Size: ${preferences.groupSize}
- Duration: ${preferences.durationDays} days
- Departure Month: ${preferences.departureMonth ? new Date(2024, preferences.departureMonth - 1).toLocaleString('default', { month: 'long' }) : 'flexible'}

Available Tours:
${tourCatalogueText}

Please recommend the most suitable tours.`;

  const response = await axios.post(
    `${baseUrl}/ml/v1/text/generation`,
    {
      model_id: modelId,
      input: `<|system|>\n${systemPrompt}\n<|user|>\n${userPrompt}\n<|assistant|>\n`,
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 600,
        temperature: 0.7,
        stop_sequences: ['<|user|>'],
      },
      project_id: projectId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: { version: '2023-05-29' },
      timeout: 30_000,
    },
  );

  const rawText: string = response.data?.results?.[0]?.generated_text ?? '{}';

  try {
    const parsed = JSON.parse(rawText.trim()) as WatsonxRecommendations;
    return {
      narrative: parsed.narrative ?? 'Based on your preferences, we found some great tours for you!',
      tourIds: Array.isArray(parsed.tourIds) ? parsed.tourIds : [],
    };
  } catch {
    logger.warn('watsonx response was not valid JSON — falling back to empty recommendations');
    return { narrative: rawText.trim(), tourIds: [] };
  }
}
