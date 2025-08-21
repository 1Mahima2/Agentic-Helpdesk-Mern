import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register(){
  const [name, setName] = useState('New User')
  const [email, setEmail] = useState('new@example.com')
  const [password, setPassword] = useState('password123')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setErr('')
    try {
      const { token } = await api.register(name, email, password)
      localStorage.setItem('token', token)
      nav('/tickets')
    } catch (e) {
      setErr('Register failed')
    }
  }

  return (
    <div className="card">
      <h3>Register</h3>
      <form onSubmit={submit} className="row">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
        <button className="btn">Register</button>
      </form>
      {err && <p style={{color:'#ef4444'}}>{err}</p>}
    </div>
  )
}
