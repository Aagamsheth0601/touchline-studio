import React,{useEffect,useRef,useState} from 'react';
import {searchNotes} from './coachingSearch.js';

export default function CoachingSearch(){
  const [query,setQuery]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const pending=useRef(null);
  useEffect(()=>()=>pending.current?.abort(),[]);
  async function search(event){
    event.preventDefault();
    pending.current?.abort();
    const controller=new AbortController();
    pending.current=controller;
    const timeout=setTimeout(()=>controller.abort(),20000);
    setLoading(true);setError('');setResult(null);
    try {const notes=await searchNotes(query,{signal:controller.signal});if(pending.current===controller)setResult({query:query.trim(),notes});}
    catch(e){if(pending.current===controller)setError(e.name==='AbortError'?'Search took too long. Please retry.':e.message || 'Search could not connect. Please retry.');}
    finally {clearTimeout(timeout);if(pending.current===controller)setLoading(false);}
  }
  return <section className="coaching-library" aria-labelledby="library-heading">
    <p className="eyebrow">COACHING LIBRARY / SEARCH BY MEANING</p>
    <h2 id="library-heading">Understand the decision.</h2>
    <p>Search eight short Touchline practice notes about passing, pressure and support. This finds original notes; it does not generate an AI answer.</p>
    <form onSubmit={search}><label htmlFor="coach-question">What would you like to understand?</label><div className="search-row"><input id="coach-question" value={query} onChange={e=>setQuery(e.target.value)} minLength={8} maxLength={300} required placeholder="Why carry toward a defender before passing?"/><button disabled={loading} type="submit">{loading?'Searching...':'Find notes'}</button></div></form>
    <div className="search-examples"><span>Try:</span>{['How do I draw a defender out?','When is a short pass useful?','How can one defender slow two attackers?'].map(q=><button key={q} onClick={()=>{setQuery(q);document.getElementById('coach-question')?.focus();}}>{q}</button>)}</div>
    {loading && <p role="status">Finding related coaching notes...</p>}
    {error && <p role="alert" className="search-error">{error}</p>}
    {result && <div aria-live="polite"><p>{result.notes.length ? `Notes related to: ${result.query}` : 'No strong match in this small library. Try a question about passing, pressure, support or defending a two-on-one.'}</p><div className="note-results">{result.notes.map(note=><article key={note.id}><span className="note-topic">{note.topic}</span><h3>{note.title}</h3><p>{note.content}</p><small>Source: Touchline practice note · {note.id}</small><details><summary>About this match</summary><p>Retrieved by meaning using gte-small embeddings and pgvector. Similarity: {note.similarity.toFixed(3)}. This score is not a confidence or correctness percentage.</p></details></article>)}</div></div>}
    <small className="library-disclosure">Original, authored learning notes; not professionally reviewed coaching guidance. Questions are sent to our Supabase search service. Search text is not stored by this feature.</small>
  </section>;
}
