import { createClient } from 'npm:@supabase/supabase-js@2.49.8';

const model = new Supabase.ai.Session('gte-small');
const adminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const db = createClient(Deno.env.get('SUPABASE_URL')!, adminKey);
const allowed = new Set(['https://fut-studio.netlify.app','http://127.0.0.1:5173']);

Deno.serve(async req => {
  const origin = req.headers.get('origin');
  const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':origin && allowed.has(origin) ? origin : 'https://fut-studio.netlify.app','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
  const reply = (body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(origin && !allowed.has(origin)) return reply({error:'Origin not allowed.'},403);
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers});
  if(req.method!=='POST') return reply({error:'Use POST.'},405);
  try {
    const raw=await req.text();
    if(raw.length>2000) return reply({error:'Request is too large.'},413);
    let body;
    try {body=JSON.parse(raw);} catch {return reply({error:'Send a JSON request.'},400);}
    if(!body || typeof body!=='object') return reply({error:'Send a JSON object.'},400);
    // Only the dashboard/server service credential can index the fixed note library.
    // Nothing supplied by a visitor is ever inserted into the knowledge base.
    if(body.action==='index'){
      const indexKey=req.headers.get('x-index-key');
      if(!indexKey) return reply({error:'Indexing is restricted.'},403);
      const indexDb=createClient(Deno.env.get('SUPABASE_URL')!,indexKey);
      const {error:authError}=await indexDb.from('coaching_notes').select('id').limit(1);
      if(authError) return reply({error:'Indexing is restricted.'},403);
      const {data,error}=await indexDb.from('coaching_notes').select('id,title,content').is('embedding',null);
      if(error) throw error;
      for(const note of data || []){
        const embedding=await model.run(`${note.title}. ${note.content}`,{mean_pool:true,normalize:true});
        const {error:writeError}=await indexDb.from('coaching_notes').update({embedding:JSON.stringify(embedding)}).eq('id',note.id);
        if(writeError) throw writeError;
      }
      return reply({indexed:data?.length || 0});
    }
    const query=typeof body.query==='string'?body.query.trim():'';
    if(query.length<8 || query.length>300) return reply({error:'Use a question between 8 and 300 characters.'},400);
    const {data:slot,error:slotError}=await db.rpc('take_coaching_search_slot');
    if(slotError) throw slotError;
    if(!slot) return reply({error:'The practice library is busy. Try again in a minute.'},429);
    const {count,error:countError}=await db.from('coaching_notes').select('id',{count:'exact',head:true}).not('embedding','is',null);
    if(countError) throw countError;
    if(count!==8) return reply({error:'The coaching library is still being prepared. Try again later.'},503);
    const embedding=await model.run(query,{mean_pool:true,normalize:true});
    const {data,error}=await db.rpc('match_coaching_notes',{query_embedding:JSON.stringify(embedding)});
    if(error) throw error;
    return reply({notes:data || [],model:'gte-small-v1'});
  } catch(error) {
    console.error('Coaching search failed',error instanceof Error?error.message:'Unknown error');
    return reply({error:'Search could not finish. Please try again.'},500);
  }
});
