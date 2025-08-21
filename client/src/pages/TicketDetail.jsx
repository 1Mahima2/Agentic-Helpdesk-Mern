import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

export default function TicketDetail(){
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [audit, setAudit] = useState([])
  const [role, setRole] = useState(null)

  async function load(){
    setData(await api.ticketDetail(id))
    setAudit(await api.ticketAudit(id))
    setRole(await api.meRole())
  }
  useEffect(()=>{ load() }, [id])

  if (!data) return <div className="card">Loading...</div>
  const { ticket, suggestion } = data

  return (
    <div>
      <div className="card">
        <h3>{ticket.title}</h3>
        <p>{ticket.description}</p>
        <p>Status: <span className="badge">{ticket.status}</span></p>
      </div>

      {suggestion && (
        <div className="card">
          <h4>Agent Suggestion</h4>
          <p><b>Category:</b> {suggestion.predictedCategory} | <b>Confidence:</b> {suggestion.confidence}</p>
          <pre style={{whiteSpace:'pre-wrap'}}>{suggestion.draftReply}</pre>
          {role !== 'user' && ticket.status !== 'resolved' && (
            <button className="btn" onClick={async()=>{ await api.ticketReply(ticket._id); load(); }}>Send Reply & Resolve</button>
          )}
        </div>
      )}

      <div className="card">
        <h4>Audit Timeline</h4>
        <ul>
          {audit.map((a,i)=>(
            <li key={i}>
              <small className="mono">{a.timestamp}</small> — <b>{a.actor}</b> — {a.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
