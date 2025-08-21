import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Tickets(){
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ title:'', description:'', category:'other' })

  async function load(){ setRows(await api.tickets({})) }
  useEffect(()=>{ load() }, [])

  return (
    <div>
      <div className="card">
        <h3>Create Ticket</h3>
        <div className="row">
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
          <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
            <option>other</option>
            <option>billing</option>
            <option>tech</option>
            <option>shipping</option>
          </select>
        </div>
        <div className="row">
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} style={{width:'100%'}} rows={4}></textarea>
        </div>
        <button className="btn" onClick={async ()=>{
          await api.ticketCreate(form); setForm({ title:'', description:'', category:'other' }); setTimeout(load, 500);
        }}>Create</button>
      </div>

      <div className="card">
        <h3>Tickets</h3>
        <table className="table">
          <thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Updated</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id}>
                <td><Link to={`/tickets/${r._id}`}>{r.title}</Link></td>
                <td><span className={"badge " + (r.status==='resolved'?'status-resolved': r.status==='waiting_human'?'status-waiting':'status-open')}>{r.status}</span></td>
                <td>{r.category}</td>
                <td>{new Date(r.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
