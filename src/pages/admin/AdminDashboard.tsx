import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Settings, Calendar, Image as ImageIcon, Users, LogOut, LayoutDashboard, Plus, Trash2, CheckCircle, MessageSquare, Quote, Save, Mail, Wifi } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

interface CalEvent { id: string; title: string; date: string; time?: string; venue?: string; description?: string; category?: string }
interface Feedback { id: string; name: string; feedback: string; createdAt?: { toDate: () => Date } }
type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'image'
type FieldConfig = { name: string; label: string; type?: FieldType; required?: boolean; options?: string[]; placeholder?: string }

const CATEGORIES = ['Faith', 'Community', 'Service', 'Fun']

async function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = 30000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out. Check your Firebase config, internet connection, and rules.`)), timeoutMs)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timeoutId!)
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function getSafeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '')
}

function DiagnosticsTab() {
  const [status, setStatus] = useState('')
  const [testing, setTesting] = useState(false)

  const runTest = async () => {
    setTesting(true)
    setStatus('')
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Auth failed: no signed-in admin user found.')
      await withTimeout(setDoc(doc(db, 'diagnostics', 'connectionTest'), {
        uid: user.uid,
        checkedAt: serverTimestamp()
      }, { merge: true }), 'Firestore test write', 10000)
      setStatus('Success: Auth and Firestore writes are working.')
    } catch (err) {
      setStatus(getErrorMessage(err))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <h3 className="font-heading text-lg text-cream mb-5 flex items-center gap-2"><Wifi size={18} className="text-gold" /> Firebase Diagnostics</h3>
      <div className="space-y-4">
        <p className="text-cream/50 text-sm">Run this if saving gets stuck. It checks whether the signed-in admin can write to Firestore.</p>
        <button type="button" onClick={runTest} disabled={testing} className="btn-premium btn-primary px-8 py-3 text-sm">{testing ? 'Testing...' : 'Run Connection Test'}</button>
        {status && <div className={`${status.startsWith('Success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} border text-sm p-3 rounded-xl`}>{status}</div>}
      </div>
    </div>
  )
}

function AdminHomeTab({ onOpenTab }: { onOpenTab: (tab: string) => void }) {
  const quickActions = [
    { title: 'General Settings', description: 'Update hero, about, and footer content.', tab: 'general', icon: Settings },
    { title: 'Events', description: 'Add upcoming and previous youth events.', tab: 'mainEvents', icon: Calendar },
    { title: 'Gallery', description: 'Upload and organize community photos.', tab: 'gallery', icon: ImageIcon },
    { title: 'Core Team', description: 'Manage members and leadership details.', tab: 'team', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-semibold mb-3">Welcome back</p>
        <h3 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-tight text-cream mb-3">Website Control Center</h3>
        <p className="font-['Outfit'] text-cream/45 text-sm md:text-base leading-relaxed max-w-2xl">Choose what you want to update. Keep the website fresh with new events, gallery moments, team updates, and community feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button key={action.tab} type="button" onClick={() => onOpenTab(action.tab)} className="group text-left rounded-3xl border border-white/10 bg-white/[0.035] p-5 hover:border-gold/25 hover:bg-white/[0.055] transition-all duration-300">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gold/10 text-gold group-hover:bg-gold/15 transition-colors">
                <Icon size={20} />
              </span>
              <h4 className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-cream mb-1">{action.title}</h4>
              <p className="font-['Outfit'] text-cream/40 text-sm leading-relaxed">{action.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CollectionTab({ title, collectionName, fields, initialForm }: { title: string; collectionName: string; fields: FieldConfig[]; initialForm: Record<string, any> }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingField, setUploadingField] = useState('')
  const inputClass = "w-full glass-input rounded-xl px-4 py-3 text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:ring-1 focus:ring-sunset/50"

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => setError(getErrorMessage(err)))
  }, [collectionName])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing = fields.find(f => f.required && !String(form[f.name] ?? '').trim())
    if (missing) {
      setError(`Please provide ${missing.label.toLowerCase()}.`)
      return
    }
    setError('')
    setSaving(true)
    try {
      await withTimeout(addDoc(collection(db, collectionName), { ...form, createdAt: serverTimestamp() }), `Saving ${title.toLowerCase()}`)
      setForm(initialForm)
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${title.toLowerCase()} item?`)) return
    try {
      await withTimeout(deleteDoc(doc(db, collectionName, id)), `Deleting ${title.toLowerCase()}`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = form[field.name]
    if (field.type === 'image') {
      return (
        <div className="space-y-3">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-center hover:border-gold/40 transition-colors">
            <ImageIcon size={24} className="text-gold mb-2" />
            <span className="text-cream/70 text-sm">{uploadingField === field.name ? 'Uploading...' : 'Click to upload image'}</span>
            <span className="text-cream/30 text-xs mt-1">PNG, JPG, WEBP or GIF</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === field.name}
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploadingField(field.name)
                setError('')
                try {
                  const fileRef = ref(storage, `admin-uploads/${collectionName}/${Date.now()}-${getSafeFileName(file.name)}`)
                  await withTimeout(uploadBytes(fileRef, file), 'Image upload')
                  const url = await withTimeout(getDownloadURL(fileRef), 'Getting image URL')
                  setForm(p => ({ ...p, [field.name]: url }))
                } catch (err) {
                  setError(getErrorMessage(err))
                } finally {
                  setUploadingField('')
                  e.target.value = ''
                }
              }}
            />
          </label>
          {value && <img src={value} alt="Uploaded preview" className="h-24 w-full rounded-xl object-cover border border-white/10" />}
        </div>
      )
    }
    if (field.type === 'textarea') {
      return <textarea value={value ?? ''} onChange={e => { setForm(p => ({ ...p, [field.name]: e.target.value })); setError('') }} className={`${inputClass} resize-none h-24`} placeholder={field.placeholder} />
    }
    if (field.type === 'select') {
      return (
        <select value={value ?? ''} onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))} className={`${inputClass} bg-primary`}>
          {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      )
    }
    if (field.type === 'checkbox') {
      return <input type="checkbox" checked={Boolean(value)} onChange={e => setForm(p => ({ ...p, [field.name]: e.target.checked }))} className="w-4 h-4 accent-sunset" />
    }
    return <input type={field.type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={e => { setForm(p => ({ ...p, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })); setError('') }} className={inputClass} placeholder={field.placeholder} />
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="font-heading text-lg text-cream mb-5 flex items-center gap-2"><Plus size={18} className="text-gold" /> Add {title}</h3>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl animate-fade-in">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">{field.label}{field.required ? ' *' : ''}</label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-premium btn-primary px-8 py-3 text-sm">{saving ? 'Saving...' : `Add ${title}`}</button>
            {success && <span className="flex items-center gap-2 text-orange-500 text-sm"><CheckCircle size={16} /> Saved!</span>}
          </div>
        </form>
      </div>
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="font-heading text-lg text-cream mb-5">{title} Items ({items.length})</h3>
        {items.length === 0 ? <p className="text-cream/30 text-sm italic text-center py-8">No items yet. Add one above.</p> : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="font-heading text-sm text-cream">{item.title || item.name || item.caption || item.author || item.email || 'Untitled'}</span>
                  <p className="text-cream/40 text-xs mt-0.5 truncate">{item.role || item.category || item.description || item.quote || item.src || item.message}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="ml-4 p-2 text-cream/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200 flex-shrink-0"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GeneralTab() {
  const defaultSettings = {
    welcomeLabel: 'Welcome to',
    heroTitle: "St. Anne's",
    heroAccent: 'Youth',
    heroSubtitle: 'Faith  •  Community  •  Service',
    aboutTitle: 'More Than a Youth Group',
    aboutText: "St. Anne's Youth is a vibrant community of young believers who come together to grow in faith, build lasting friendships, and celebrate life. We believe in creating spaces where everyone feels welcome, valued, and inspired to make a difference.",
    aboutImage: '/core-team/about.jpeg',
    activeMembers: '50+',
    eventsOrganized: '15+',
    yearsStrong: '3+',
    footerText: 'A vibrant community of young believers united by faith, friendship, and the joy of celebration.',
    phone1: '+91 9967890390 (Ira Rathore)',
    phone2: '+91 9137670192 (Benedict Xalxo)',
    instagramHandle: '@stannes_youth',
    instagramUrl: 'https://instagram.com/stannes_youth',
    email: 'st.annesyouth10@gmail.com',
    address: "St. Anne's Church,\nMazagaon"
  }
  const [form, setForm] = useState(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadingAbout, setUploadingAbout] = useState(false)
  const [error, setError] = useState('')
  const inputClass = "w-full glass-input rounded-xl px-4 py-3 text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:ring-1 focus:ring-sunset/50"

  useEffect(() => {
    return onSnapshot(doc(db, 'siteSettings', 'general'), snap => {
      if (snap.exists()) setForm(p => ({ ...p, ...snap.data() }))
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await withTimeout(setDoc(doc(db, 'siteSettings', 'general'), form, { merge: true }), 'Saving settings')
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSaving(false) }
  }

  const fields: { name: keyof typeof defaultSettings; label: string; textarea?: boolean }[] = [
    { name: 'welcomeLabel', label: 'Hero Small Label' },
    { name: 'heroTitle', label: 'Hero Title' },
    { name: 'heroAccent', label: 'Hero Accent Word' },
    { name: 'heroSubtitle', label: 'Hero Subtitle' },
    { name: 'aboutTitle', label: 'About Title' },
    { name: 'aboutText', label: 'About Text', textarea: true },
    { name: 'aboutImage', label: 'About Image' },
    { name: 'activeMembers', label: 'Active Members' },
    { name: 'eventsOrganized', label: 'Events Organized' },
    { name: 'yearsStrong', label: 'Years Strong' },
    { name: 'footerText', label: 'Footer Text', textarea: true },
    { name: 'phone1', label: 'Phone 1' },
    { name: 'phone2', label: 'Phone 2' },
    { name: 'instagramHandle', label: 'Instagram Handle' },
    { name: 'instagramUrl', label: 'Instagram URL' },
    { name: 'email', label: 'Email' },
    { name: 'address', label: 'Address', textarea: true },
  ]

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <h3 className="font-heading text-lg text-cream mb-5 flex items-center gap-2"><Save size={18} className="text-gold" /> General Website Settings</h3>
      <form onSubmit={save} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl animate-fade-in">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.name} className={field.textarea ? 'md:col-span-2' : ''}>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">{field.label}</label>
              {field.name === 'aboutImage' ? (
                <div className="space-y-3">
                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-center hover:border-gold/40 transition-colors">
                    <ImageIcon size={24} className="text-gold mb-2" />
                    <span className="text-cream/70 text-sm">{uploadingAbout ? 'Uploading...' : 'Click to upload image'}</span>
                    <span className="text-cream/30 text-xs mt-1">PNG, JPG, WEBP or GIF</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingAbout}
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadingAbout(true)
                        setError('')
                        try {
                          const fileRef = ref(storage, `admin-uploads/siteSettings/${Date.now()}-${getSafeFileName(file.name)}`)
                          await withTimeout(uploadBytes(fileRef, file), 'Image upload')
                          const url = await withTimeout(getDownloadURL(fileRef), 'Getting image URL')
                          setForm(p => ({ ...p, aboutImage: url }))
                        } catch (err) {
                          setError(getErrorMessage(err))
                        } finally {
                          setUploadingAbout(false)
                          e.target.value = ''
                        }
                      }}
                    />
                  </label>
                  {form.aboutImage && <img src={form.aboutImage} alt="About preview" className="h-24 w-full rounded-xl object-cover border border-white/10" />}
                </div>
              ) : field.textarea ? <textarea value={form[field.name]} onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))} className={`${inputClass} resize-none h-24`} /> : <input value={form[field.name]} onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))} className={inputClass} />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-premium btn-primary px-8 py-3 text-sm">{saving ? 'Saving...' : 'Save Settings'}</button>
          {success && <span className="flex items-center gap-2 text-orange-500 text-sm"><CheckCircle size={16} /> Settings saved!</span>}
        </div>
      </form>
    </div>
  )
}

function CalendarTab() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '', description: '', category: 'Faith' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'calendarEvents'), orderBy('date', 'asc'))
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalEvent))))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('Please provide at least an event title and date.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await addDoc(collection(db, 'calendarEvents'), { ...form, createdAt: serverTimestamp() })
      setForm({ title: '', date: '', time: '', venue: '', description: '', category: 'Faith' })
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await deleteDoc(doc(db, 'calendarEvents', id))
  }

  const inputClass = "w-full glass-input rounded-xl px-4 py-3 text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:ring-1 focus:ring-sunset/50"

  return (
    <div className="space-y-8">
      {/* Add Form */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="font-heading text-lg text-cream mb-5 flex items-center gap-2"><Plus size={18} className="text-gold" /> Add New Event</h3>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl animate-fade-in">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Event Title *</label>
              <input value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setError(''); }} className={inputClass} placeholder="e.g. Youth Retreat 2025" />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Date *</label>
              <input type="date" value={form.date} onChange={e => { setForm(p => ({ ...p, date: e.target.value })); setError(''); }} className={inputClass} />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Venue</label>
              <input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} className={inputClass} placeholder="e.g. Parish Hall" />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass + ' bg-transparent'}>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputClass} placeholder="Short description..." />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-premium btn-primary px-8 py-3 text-sm">
              {saving ? <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : <><Plus size={15} /> Add Event</>}
            </button>
            {success && <span className="flex items-center gap-2 text-orange-500 text-sm"><CheckCircle size={16} /> Event added!</span>}
          </div>
        </form>
      </div>

      {/* Events List */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="font-heading text-lg text-cream mb-5">Scheduled Events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-cream/30 text-sm italic text-center py-8">No events yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-sm text-cream">{ev.title}</span>
                    {ev.category && <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 uppercase tracking-wider">{ev.category}</span>}
                  </div>
                  <p className="text-cream/40 text-xs mt-0.5">{new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}{ev.time ? ` · ${ev.time}` : ''}{ev.venue ? ` · ${ev.venue}` : ''}</p>
                </div>
                <button onClick={() => handleDelete(ev.id)} className="ml-4 p-2 text-cream/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200 flex-shrink-0"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MainEventsTab() {
  const [events, setEvents] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '', description: '', image: '', type: 'upcoming', featured: false })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'mainEvents'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('Please provide at least an event title and date.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await withTimeout(addDoc(collection(db, 'mainEvents'), { ...form, createdAt: serverTimestamp() }), 'Saving event')
      setForm({ title: '', date: '', time: '', venue: '', description: '', image: '', type: 'upcoming', featured: false })
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await deleteDoc(doc(db, 'mainEvents', id))
  }

  const inputClass = "w-full glass-input rounded-xl px-4 py-3 text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:ring-1 focus:ring-sunset/50"

  return (
    <div className="space-y-8">
      {/* Add Form */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="font-heading text-lg text-cream mb-5 flex items-center gap-2"><Plus size={18} className="text-gold" /> Add Main Event</h3>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl animate-fade-in">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Event Title *</label>
              <input value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setError(''); }} className={inputClass} placeholder="e.g. Hawa Hawaii Night" />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Date *</label>
              <input value={form.date} onChange={e => { setForm(p => ({ ...p, date: e.target.value })); setError(''); }} className={inputClass} placeholder="June 15, 2025" />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Time</label>
              <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputClass} placeholder="6:00 PM" />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Venue</label>
              <input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} className={inputClass} placeholder="Parish Hall" />
            </div>
            <div className="md:col-span-2">
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Image</label>
              <div className="space-y-3">
                <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-center hover:border-gold/40 transition-colors">
                  <ImageIcon size={24} className="text-gold mb-2" />
                  <span className="text-cream/70 text-sm">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</span>
                  <span className="text-cream/30 text-xs mt-1">PNG, JPG, WEBP or GIF</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploadingImage(true)
                      setError('')
                      try {
                        const fileRef = ref(storage, `admin-uploads/mainEvents/${Date.now()}-${getSafeFileName(file.name)}`)
                        await withTimeout(uploadBytes(fileRef, file), 'Image upload')
                        const url = await withTimeout(getDownloadURL(fileRef), 'Getting image URL')
                        setForm(p => ({ ...p, image: url }))
                      } catch (err) {
                        setError(getErrorMessage(err))
                      } finally {
                        setUploadingImage(false)
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
                {form.image && <img src={form.image} alt="Event preview" className="h-24 w-full rounded-xl object-cover border border-white/10" />}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none h-24`} placeholder="Event details..." />
            </div>
            <div>
              <label className="text-cream/40 text-[10px] uppercase tracking-widest block mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={`${inputClass} appearance-none bg-primary`}>
                <option value="upcoming">Upcoming</option>
                <option value="previous">Previous</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-sunset" />
              <label htmlFor="featured" className="text-cream/80 text-sm">Featured Event (Large Card)</label>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <button disabled={saving} type="submit" className="btn-premium btn-primary px-8 py-3 rounded-xl flex items-center gap-2 text-sm">{saving ? 'Saving...' : 'Add Event'}</button>
            {success && <span className="flex items-center gap-2 text-orange-500 text-sm"><CheckCircle size={16} /> Event added!</span>}
          </div>
        </form>
      </div>

      {/* Events List */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="font-heading text-lg text-cream mb-5">Main Events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-cream/30 text-sm italic text-center py-8">No events yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-sm text-cream">{ev.title}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-sunset/10 text-sunset border border-sunset/20 uppercase tracking-wider">{ev.type}</span>
                    {ev.featured && <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 uppercase tracking-wider">Featured</span>}
                  </div>
                  <p className="text-cream/40 text-xs mt-0.5">{ev.date}{ev.time ? ` · ${ev.time}` : ''}</p>
                </div>
                <button onClick={() => handleDelete(ev.id)} className="ml-4 p-2 text-cream/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200 flex-shrink-0"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FeedbackTab() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback))))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return
    await deleteDoc(doc(db, 'feedbacks', id))
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <h3 className="font-heading text-lg text-cream mb-5 flex items-center gap-2"><MessageSquare size={18} className="text-gold" /> Community Feedback ({feedbacks.length})</h3>
      {feedbacks.length === 0 ? (
        <p className="text-cream/30 text-sm italic text-center py-8">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <div key={fb.id} className="p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-cream/80 text-sm leading-relaxed mb-2">"{fb.feedback}"</p>
                  <div className="flex items-center gap-3">
                    <span className="text-gold text-xs font-semibold">— {fb.name || 'Anonymous'}</span>
                    {fb.createdAt && <span className="text-cream/25 text-[10px]">{fb.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(fb.id)} className="p-2 text-cream/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'mainEvents', label: 'Events', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'team', label: 'Core Team', icon: Users },
    { id: 'testimonials', label: 'Testimonials', icon: Quote },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'diagnostics', label: 'Diagnostics', icon: Wifi },
  ];

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col md:flex-row text-cream relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,115,74,0.07),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.05),transparent_28%)] pointer-events-none" />
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-white/10 bg-black/35 backdrop-blur-3xl flex flex-col relative z-10 shadow-2xl shadow-black/40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/logo.png" alt="St. Anne's Youth logo" className="h-14 w-14 object-contain" />
            </div>
            <div>
              <h1 className="font-['Space_Grotesk'] text-base font-bold tracking-tight text-gold uppercase">ST. ANNE'S YOUTH</h1>
              <p className="font-['Outfit'] text-cream/40 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-cream/70 text-xs">
              <LayoutDashboard className="text-sunset" size={15} />
              <span>Website control center</span>
            </div>
            <p className="mt-2 text-cream/35 text-xs leading-relaxed">Update events, gallery, team, and site content from one place.</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 border group ${isActive ? 'bg-white/[0.07] text-gold border-gold/20 shadow-lg shadow-black/10' : 'text-cream/50 hover:text-cream hover:bg-white/[0.05] border-transparent hover:border-white/10'}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-xl transition-colors ${isActive ? 'bg-gold/15 text-gold' : 'bg-white/[0.04] text-cream/40 group-hover:text-cream'}`}>
                  <Icon size={16} />
                </span>
                <span className="font-['Space_Grotesk'] text-sm font-semibold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-cream/50 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors duration-300 border border-transparent hover:border-red-400/15">
            <LogOut size={17} />
            <span className="font-['Space_Grotesk'] text-sm font-semibold tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-8 lg:p-12 overflow-y-auto relative z-10">
        <div className="ambient-glow-ocean absolute top-0 right-0 opacity-10 pointer-events-none" />
        <div className="ambient-glow-sunset absolute bottom-0 left-1/4 opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <header className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 md:p-8 shadow-2xl shadow-black/20 overflow-hidden relative">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/[0.04] blur-2xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-gold text-[10px] uppercase tracking-[0.25em] font-semibold mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                  Live Dashboard
                </div>
                <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold tracking-tight text-cream mb-2 capitalize">{tabs.find(t => t.id === activeTab)?.label}</h2>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <img src="/logo.png" alt="St. Anne's Youth logo" className="h-10 w-10 object-contain" />
                <div>
                  <p className="font-['Space_Grotesk'] text-gold text-sm font-bold tracking-tight uppercase">ST. ANNE'S YOUTH</p>
                  <p className="font-['Outfit'] text-cream/35 text-xs">Admin Dashboard</p>
                </div>
              </div>
            </div>
          </header>

          {activeTab === 'home' && <AdminHomeTab onOpenTab={setActiveTab} />}
          {activeTab === 'mainEvents' && <MainEventsTab />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'feedback' && <FeedbackTab />}
          {activeTab === 'diagnostics' && <DiagnosticsTab />}
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'gallery' && <CollectionTab title="Gallery Photo" collectionName="galleryItems" initialForm={{ src: '', caption: '', category: 'Faith', type: 'image' }} fields={[
            { name: 'caption', label: 'Caption', required: true },
            { name: 'src', label: 'Image', type: 'image', required: true },
            { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
          ]} />}
          {activeTab === 'team' && <CollectionTab title="Core Team Member" collectionName="coreTeam" initialForm={{ name: '', role: '', image: '', quote: '' }} fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'role', label: 'Role', required: true },
            { name: 'image', label: 'Image', type: 'image', required: true },
            { name: 'quote', label: 'Quote', type: 'textarea' },
          ]} />}
          {activeTab === 'testimonials' && <CollectionTab title="Testimonial" collectionName="testimonials" initialForm={{ quote: '', author: '', role: '' }} fields={[
            { name: 'quote', label: 'Quote', type: 'textarea', required: true },
            { name: 'author', label: 'Author', required: true },
            { name: 'role', label: 'Role' },
          ]} />}
          {activeTab === 'newsletter' && <CollectionTab title="Subscriber" collectionName="newsletterSubscribers" initialForm={{ email: '' }} fields={[
            { name: 'email', label: 'Email', required: true },
          ]} />}
        </div>
      </main>
    </div>
  );
}
