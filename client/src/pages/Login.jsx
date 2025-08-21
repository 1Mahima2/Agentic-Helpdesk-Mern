import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password123')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setErr('')
    try {
      const { token } = await api.login(email, password)
      localStorage.setItem('token', token)
      nav('/tickets')
    } catch (e) {
      setErr('Login failed')
    }
  }

  return (
    <div className="card">
      <h3>Login</h3>
      <form onSubmit={submit} className="row">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
        <button className="btn">Login</button>
      </form>
      {err && <p style={{color:'#ef4444'}}>{err}</p>}
    </div>
  )
}
