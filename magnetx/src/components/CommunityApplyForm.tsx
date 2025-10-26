import React, { useEffect, useState } from 'react'
import http from '../services/http'
import '../App.css'

export interface FormState {
  fullName: string
  xProfile: string
  region: string
  phone: string
  nextOfKin: string
  niche: string
  otherNiche: string
  skills: string
  otherSkill: string
  category: string
  otherCategory: string
  nominee1: string
  nominee2: string
  reason: string
}

const initialState: FormState = {
  fullName: '', xProfile: '', region: '', phone: '', nextOfKin: '', niche: '', otherNiche: '', skills: '', otherSkill: '', category: '', otherCategory: '', nominee1: '', nominee2: '', reason: ''
}

// Backend base is handled by services/http.ts via VITE_API_URL or sensible defaults

const CommunityApplyForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [niches, setNiches] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    // Use the exact lists provided (no remote fetch)
    const providedNiches = ['DeFi','NFT','Gaming','AI','Devs','Education','DeSci','DePins and RWA','Memes']
    const providedCategories = ['Airdrops','Builders','Job hunting']
    const providedSkills = [
      'Developers',
      'Trading',
      'Degen',
      'Strategists (Growth strategies, Project Managers, Project managers)',
      'Marketing',
      'Video  Editing',
      'Graphics Designers',
      'Communication'
    ]
    setNiches(providedNiches)
    setCategories(providedCategories)
    setSkills(providedSkills)
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    update(name as keyof FormState, value as any)
  }
  function validate() {
    const required: (keyof FormState)[] = ['fullName','xProfile','region','phone','nextOfKin','niche','skills','category','reason','nominee1','nominee2']
    const baseOk = required.every(k => form[k])
    const skillsOk = !(form.skills === 'Other' && !form.otherSkill)
    const nicheOk = !(form.niche === 'Other' && !form.otherNiche)
    const catOk = !(form.category === 'Other' && !form.otherCategory)
    return baseOk && skillsOk && nicheOk && catOk
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { alert('Please fill in all required fields.'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        fullName: form.fullName,
        xProfile: form.xProfile,
        region: form.region,
        phone: form.phone,
        nextOfKin: form.nextOfKin,
        niche: form.niche === 'Other' ? form.otherNiche : form.niche,
        skills: form.skills === 'Other' ? form.otherSkill : form.skills,
        category: form.category === 'Other' ? form.otherCategory : form.category,
        nominee1: form.nominee1,
        nominee2: form.nominee2,
        reason: form.reason
      }
      await http.post('/magnetx/community/apply', payload)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Submission failed')
      alert('Submission failed. Please try again.')
    } finally { setLoading(false) }
  }
  function resetForm(){ setSubmitted(false) }

  return (
    <main className="mx-container">
      <header>
        <h1>Welcome to MagnetX 🧲</h1>
        <p>A home for builders, dreamers, and doers shaping Web3. Connect with projects, investors, and like-minded creators.</p>
        {!submitted && <a className="btn" href="#apply">Join MagnetX today</a>}
      </header>

      {!submitted && (
        <div className="card" id="apply">
          <h2 className="mx-heading">Apply to Join</h2>
          <p className="mx-intro">Complete the form to request access to our WhatsApp community.</p>
          <form onSubmit={handleSubmit} autoComplete="on" noValidate>
            <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Jane Doe" required />
            <Field label="X profile Link" name="xProfile" value={form.xProfile} onChange={handleChange} placeholder="https://x.com/elizamarrk" required />
            <Field label="Region / Country" name="region" value={form.region} onChange={handleChange} placeholder="Lagos, Nigeria" required />
            <Field label="Phone (WhatsApp number)" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+234 801 234 5678" required />
            <Field label="Next of Kin number (WhatsApp)" name="nextOfKin" type="tel" value={form.nextOfKin} onChange={handleChange} placeholder="+234 801 234 5678" required />
            <SelectField label="Your Web3 Niche" name="niche" value={form.niche} onChange={handleChange} placeholder="Choose a niche…" options={[...niches, 'Other']} required />
            {form.niche === 'Other' && (
              <Field name="otherNiche" value={form.otherNiche} onChange={handleChange} placeholder="Enter your niche" required />
            )}
            <div className="mx-field-group">
              <SelectField label="Your Skills" name="skills" value={form.skills} onChange={handleChange} placeholder="Choose a skill…" options={[...skills.filter(s=>s!=='Other'), 'Other']} required />
              {form.skills === 'Other' && (
                <Field name="otherSkill" value={form.otherSkill} onChange={handleChange} placeholder="Enter your skill" required />
              )}
            </div>
            <SelectField label="Category" name="category" value={form.category} onChange={handleChange} placeholder="Select a category…" options={[...categories, 'Other']} required />
            {form.category === 'Other' && (
              <Field name="otherCategory" value={form.otherCategory} onChange={handleChange} placeholder="Enter your category" required />
            )}
            <div className="mx-field-group">
              <Field label="Nominate Friend #1 (X profile link)" name="nominee1" value={form.nominee1} onChange={handleChange} placeholder="https://x.com/friend1" required />
              <Field label="Nominate Friend #2 (X profile link)" name="nominee2" value={form.nominee2} onChange={handleChange} placeholder="https://x.com/friend2" required />
            </div>
            <Field as="textarea" label="Why do you want to join MagnetX?" name="reason" value={form.reason} onChange={handleChange} placeholder="Share your reason in a few sentences" required textareaProps={{ rows: 4, maxLength: 600 }} />
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Submitting…' : 'Submit Application'}</button>
            {error && <p className="mx-error">{error}</p>}
          </form>
        </div>
      )}

      {submitted && (
        <div className="card" id="afterSubmit">
          <div className="success">
            <strong>Thanks! Your application has been recorded.</strong>
            <p className="mx-after-text">Click below to join the MagnetX WhatsApp community or return to edit your application.</p>
            <div className="actions">
              <a className="btn" id="whatsappBtn" href="https://chat.whatsapp.com/BgepHZJm2DRIfLKpVOPDP2?mode=wwt" target="_blank" rel="noreferrer noopener">Join WhatsApp Community</a>
              <button className="btn btn-outline" onClick={resetForm} type="button">Return to Form</button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>Built with care by MagnetX · <a className="mx-footer-link" href="#">Community rules & privacy</a></p>
      </footer>
    </main>
  )
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  name: keyof FormState
  as?: 'input' | 'textarea'
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

function Field({ label, name, as='input', textareaProps, ...rest }: FieldProps) {
  return (
    <div className="mx-field">
      {label && <label htmlFor={name}>{label}</label>}
      {as === 'textarea' ? (
        <textarea id={name} name={name} {...textareaProps} {...rest as any} />
      ) : (
        <input id={name} name={name} {...rest} />
      )}
    </div>
  )
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: keyof FormState
  placeholder: string
  options: string[]
}

function SelectField({ label, name, placeholder, options, ...rest }: SelectFieldProps) {
  return (
    <div className="mx-field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} {...rest}>
        <option value="" disabled hidden selected={!(rest as any).value}>{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}

export default CommunityApplyForm