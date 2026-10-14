import React, {useEffect, useRef, useState} from 'react';
import {noteSource} from './coachingSearch.js';

// The parent remounts this form when the decision changes, cancelling stale answers.
export default function DecisionQuestion({scenario, choice}) {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pending = useRef(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function ask(event) {
    event.preventDefault();
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decision-answer`, {
        method: 'POST', signal: controller.signal,
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_EDGE_ANON_KEY}`},
        body: JSON.stringify({question: question.trim(), scenarioId: scenario.id, choiceId: choice})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not get an explanation. Please retry.');
      if (!['answer', 'insufficient'].includes(data.status) || typeof data.answer !== 'string' || !Array.isArray(data.sources)) throw new Error('The explanation was incomplete. Please retry.');
      if (pending.current === controller) setResult(data);
    } catch (e) {
      if (pending.current === controller) setError(e.name === 'AbortError' ? 'The explanation took too long. Please retry.' : e.message);
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) setLoading(false);
    }
  }

  return <section className="coaching-library decision-question" aria-labelledby="decision-question-heading">
    <p className="eyebrow">THE REPLAY ROOM / ASK WHY</p>
    <h2 id="decision-question-heading">Ask about this decision.</h2>
    <p>You chose: <strong>{scenario.options[choice].label}</strong></p>
    <form onSubmit={ask}>
      <label htmlFor="decision-question">What would you like explained about this move?</label>
      <div className="search-row"><input id="decision-question" value={question} onChange={e => setQuestion(e.target.value)} required minLength={8} maxLength={300} placeholder="What would change if the defender stayed back?"/><button disabled={loading} type="submit">{loading ? 'Thinking...' : 'Ask about my move'}</button></div>
    </form>
    <div className="search-examples"><span>Try:</span>{['Why did this option work in the replay?', 'What if the defender held their position?'].map(q => <button key={q} onClick={() => {setQuestion(q); document.getElementById('decision-question')?.focus();}}>{q}</button>)}</div>
    {loading && <p role="status">Reading the situation and related coaching notes...</p>}
    {error && <p className="search-error" role="alert">{error}</p>}
    {result && <div className="decision-answer" aria-live="polite"><h3>{result.status === 'answer' ? 'An explanation of your move' : 'Not enough supporting information'}</h3><p>{result.answer}</p>{result.sources.length > 0 && <><h4>Supporting coaching notes</h4>{result.sources.map(note => <div key={note.id}><span>{note.title}</span>{noteSource(note) && <a className="note-source" href={noteSource(note)} target="_blank" rel="noopener noreferrer">Read source: {note.source_title}</a>}</div>)}</>}</div>}
    <small className="library-disclosure">AI explanations can be wrong. Our replays show authored outcomes, not predictions. Your question, this scenario and related notes are sent to Google Gemini. Avoid personal information. This feature does not save your questions.</small>
  </section>;
}
