import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function KB(){
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ title:'', body:'', tags:'billing', status:'published' })

  async function load(){ setRows(await api.kbSearch(query)) }
  useEffect(()=>{ load() }, [])

  return (
    <div>
      <div className="card">
        <h3>Knowledge Base</h3>
        <div className="row">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." />
          <button className="btn" onClick={load}>Search</button>
        </div>
      </div>

      <div className="card">
        <h4>Add / Edit Article</h4>
        <div className="row">
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
          <input placeholder="Tags (comma)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
          <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option>draft</option>
            <option>published</option>
          </select>
        </div>
        <div className="row">
          <textarea placeholder="Body" value={form.body} onChange={e=>setForm({...form, body:e.target.value})} style={{width:'100%'}} rows={5}></textarea>
        </div>
        <button className="btn" onClick={async ()=>{
          const payload = { ...form, tags: String(form.tags).split(',').map(s=>s.trim()).filter(Boolean) }
          await api.kbCreate(payload); setForm({ title:'', body:'', tags:'billing', status:'published' }); load();
        }}>Save</button>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Title</th><th>Tags</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id}>
                <td>{r.title}</td>
                <td>{(r.tags||[]).join(', ')}</td>
                <td>{r.status}</td>
                <td><button className="btn ghost" onClick={async ()=>{ await api.kbDelete(r._id); load(); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
