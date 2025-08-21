import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Settings(){
  const [cfg, setCfg] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(()=>{
    api.meRole().then(setRole)
    api.configGet().then(setCfg)
  }, [])

  if (role !== 'admin') return <div className="card">Admins only</div>
  if (!cfg) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <h3>Agent Settings</h3>
      <div className="row">
        <label><input type="checkbox" checked={cfg.autoCloseEnabled} onChange={e=>setCfg({...cfg, autoCloseEnabled: e.target.checked})}/> Auto Close Enabled</label>
        <input type="number" step="0.01" min="0" max="1" value={cfg.confidenceThreshold} onChange={e=>setCfg({...cfg, confidenceThreshold: Number(e.target.value)})} />
      </div>
      <button className="btn" onClick={async()=>{
        const updated = await api.configPut({ autoCloseEnabled: cfg.autoCloseEnabled, confidenceThreshold: cfg.confidenceThreshold })
        setCfg(updated)
      }}>Save</button>
    </div>
  )
}
