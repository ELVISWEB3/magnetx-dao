import { useState } from 'react'
import AdminDashboard from './components/AdminDashboard'
import CommunityApplyForm from './components/CommunityApplyForm'
import './App.css'

function App(){
  const [path] = useState(()=> (typeof window !== 'undefined' ? window.location.pathname : ''))
  if(path === '/admin/community/form-submission') return <AdminDashboard />
  return <CommunityApplyForm />
}

export default App
