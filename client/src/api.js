const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function headers() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  async login(email, password) {
    const r = await fetch(`${API_URL}/api/auth/login`, { method:'POST', headers: headers(), body: JSON.stringify({ email, password }) });
    if (!r.ok) throw new Error('Login failed');
    return r.json();
  },
  async register(name, email, password) {
    const r = await fetch(`${API_URL}/api/auth/register`, { method:'POST', headers: headers(), body: JSON.stringify({ name, email, password }) });
    if (!r.ok) throw new Error('Register failed');
    return r.json();
  },
  async meRole() {
    // decode role from token
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch { return null; }
  },
  async kbSearch(query='') {
    const r = await fetch(`${API_URL}/api/kb?query=${encodeURIComponent(query)}`, { headers: headers() });
    return r.json();
  },
  async kbCreate(data) {
    const r = await fetch(`${API_URL}/api/kb`, { method:'POST', headers: headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error('KB create failed');
    return r.json();
  },
  async kbUpdate(id, data) {
    const r = await fetch(`${API_URL}/api/kb/${id}`, { method:'PUT', headers: headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error('KB update failed');
    return r.json();
  },
  async kbDelete(id) {
    const r = await fetch(`${API_URL}/api/kb/${id}`, { method:'DELETE', headers: headers() });
    if (!r.ok) throw new Error('KB delete failed');
    return r.json();
  },
  async tickets(params={}) {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/tickets?${qs}`, { headers: headers() });
    return r.json();
  },
  async ticketCreate(data) {
    const r = await fetch(`${API_URL}/api/tickets`, { method:'POST', headers: headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error('Ticket create failed');
    return r.json();
  },
  async ticketDetail(id) {
    const r = await fetch(`${API_URL}/api/tickets/${id}`, { headers: headers() });
    return r.json();
  },
  async ticketAudit(id) {
    const r = await fetch(`${API_URL}/api/tickets/${id}/audit`, { headers: headers() });
    return r.json();
  },
  async ticketReply(id) {
    const r = await fetch(`${API_URL}/api/tickets/${id}/reply`, { method:'POST', headers: headers() });
    if (!r.ok) throw new Error('Reply failed');
    return r.json();
  },
  async configGet() {
    const r = await fetch(`${API_URL}/api/config`, { headers: headers() });
    return r.json();
  },
  async configPut(data) {
    const r = await fetch(`${API_URL}/api/config`, { method:'PUT', headers: headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error('Config update failed');
    return r.json();
  }
}
