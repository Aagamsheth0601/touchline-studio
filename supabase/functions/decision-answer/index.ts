import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
import scenarios from './scenarios.json' with {type: 'json'};
import {insufficient, instruction, validateQuestion, validateAnswer, isCredentialRequest} from './contract.js';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const embeddingModel = new Supabase.ai.Session('gte-small');
const origins = new Set(['https://fut-studio.netlify.app', 'http://127.0.0.1:5173']);

Deno.serve(async req => {
  const origin = req.headers.get('origin');
  const headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin && origins.has(origin) ? origin : 'https://fut-studio.netlify.app', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin'};
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers});
  if (origin && !origins.has(origin)) return reply({error: 'Origin not allowed.'}, 403);
  if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (req.method !== 'POST') return reply({error: 'Use POST.'}, 405);
  try {
    const raw = await req.text();
    if (raw.length > 2000) return reply({error: 'Request is too large.'}, 413);
    let input;
    try {input = validateQuestion(JSON.parse(raw), scenarios);} catch {return reply({error: 'Choose a valid move and ask a question between 8 and 300 characters.'}, 400);}
    if (isCredentialRequest(input.question)) return reply(insufficient);
    const key = Deno.env.get('GEMINI_API_KEY');
    // Deployment remains inert until the owner explicitly enables provider use.
    if (!key || Deno.env.get('DECISION_ANSWERS_ENABLED') !== 'true') return reply({error: 'AI explanations are not connected yet. The replay explanation and coaching library are still available.'}, 503);
    const {data: slot, error: slotError} = await db.rpc('take_decision_answer_slot');
    if (slotError) throw slotError;
    if (!slot) return reply({error: 'The shared demo question limit has been reached. Please try later.'}, 429);
    // Search the question itself: unrelated questions must not inherit a strong scenario match.
    const embedding = await embeddingModel.run(input.question, {mean_pool: true, normalize: true});
    const {data, error} = await db.rpc('match_coaching_notes', {query_embedding: JSON.stringify(embedding)});
    if (error) throw error;
    const notes = (data || []).filter((n: any) => n.similarity >= 0.82 && (n.scenario === 'both' || n.scenario === input.context.scenarioId) && n.source_url && n.source_title);
    if (!notes.length) return reply(insufficient);
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
      method: 'POST', signal: AbortSignal.timeout(20000),
      headers: {'Content-Type': 'application/json', 'x-goog-api-key': key},
      body: JSON.stringify({systemInstruction: {parts: [{text: instruction}]}, contents: [{role: 'user', parts: [{text: JSON.stringify({question: input.question, scenario: input.context, notes: notes.map((n: any) => ({id: n.id, title: n.title, content: n.content}))})}]}], generationConfig: {temperature: 0.2, maxOutputTokens: 600, responseMimeType: 'application/json', responseSchema: {type: 'OBJECT', properties: {status: {type: 'STRING', enum: ['answer', 'insufficient']}, answer: {type: 'STRING'}, noteIds: {type: 'ARRAY', items: {type: 'STRING'}}}, required: ['status', 'answer', 'noteIds']}}})
    });
    if (!response.ok) return reply({error: response.status === 429 ? 'Gemini is at its current request limit. Please try later.' : 'The AI provider could not answer. Please retry.'}, response.status === 429 ? 429 : 502);
    const output = await response.json();
    const candidate = output.candidates?.[0];
    // Never show truncated output as a completed explanation.
    if (candidate?.finishReason !== 'STOP') return reply({error: 'The AI explanation was interrupted or unavailable. Please retry.'}, 502);
    try {
      const text = candidate.content.parts.filter((p: any) => !p.thought && typeof p.text === 'string').map((p: any) => p.text).join('');
      return reply(validateAnswer(JSON.parse(text), notes, input.context.observedOutcome));
    } catch {return reply({error: 'The explanation could not be verified against the retrieved notes. Please retry.'}, 502);}
  } catch {
    // Do not log questions, provider responses or credentials.
    console.error('Decision explanation failed');
    return reply({error: 'The explanation could not finish. Please try again.'}, 500);
  }
});
