// Cosine similarity is a retrieval score, not a probability of correctness.
// Calibrated against the small checked-in evaluation set; not a universal cutoff.
export const MIN_SIMILARITY = 0.82;
export function selectNotes(payload) {
  if(!payload || !Array.isArray(payload.notes)) throw new Error('Search returned an invalid response. Please retry.');
  return payload.notes.filter(n=>n && typeof n.id==='string' && typeof n.title==='string' && typeof n.content==='string' && Number.isFinite(n.similarity) && n.similarity>=MIN_SIMILARITY).slice(0,3);
}
export async function searchNotes(query,{signal}={}) {
  const question=query.trim();
  if(question.length<8 || question.length>300) throw new Error('Use a question between 8 and 300 characters.');
  const url=import.meta.env?.VITE_SUPABASE_URL;
  if(!url) throw new Error('Coaching search is not configured yet.');
  const response=await fetch(`${url}/functions/v1/coaching-search`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${import.meta.env?.VITE_SUPABASE_EDGE_ANON_KEY || ''}`},body:JSON.stringify({query:question}),signal});
  let payload;
  try {payload=await response.json();} catch {throw new Error('Search is unavailable right now. Please retry.');}
  if(!response.ok) throw new Error(payload.error || 'Search could not finish. Please retry.');
  return selectNotes(payload);
}
