import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { api } from './api'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import KB from './pages/KB.jsx'
import Tickets from './pages/Tickets.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import Settings from './pages/Settings.jsx'

function Nav() {
  const [role, setRole] = useState(null)
  const nav = useNavigate()

  useEffect(()=>{ api.meRole().then(setRole) }, [])

  function logout(){
    localStorage.removeItem('token')
    setRole(null)
    nav('/login')
  }

  return (
    <div className="nav">
      <Link to="/">Helpdesk</Link>
      <Link to="/tickets">Tickets</Link>
      {role === 'admin' && <Link to="/kb">KB</Link>}
      {role === 'admin' && <Link to="/settings">Settings</Link>}
      <div className="nav-right">
        {!role && <Link to="/login" className="btn">Login</Link>}
        {!role && <Link to="/register" className="btn ghost" style={{marginLeft:8}}>Register</Link>}
        {role && <span className="badge" style={{marginRight:8}}>Role: {role}</span>}
        {role && <button className="btn ghost" onClick={logout}>Logout</button>}
      </div>
    </div>
  )
}

export default function App(){
  return (
    <div>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/kb" element={<KB />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  )
}

function Home(){
  return (
    <div className="card">
      <h2>Smart Helpdesk with Agentic Triage</h2>
      <p>Use the navigation to manage Knowledge Base, Tickets, and Settings.</p>
      <p><small className="mono">Seed users: admin@example.com / agent@example.com / user@example.com — password: password123</small></p>
    </div>
  )
}
