import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Building2, Plus, Users, Eye, Search, ToggleLeft, ToggleRight, Edit, Trash2, Upload, ArrowUpRight } from 'lucide-react'
import { authAPI, propertyAPI, leadAPI, newProjectAPI } from '../services/api'
import { normalizeProperty } from '../utils/propertyMapper'
import toast, { Toaster } from 'react-hot-toast'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'add', label: 'Add Property', icon: Plus },
  { id: 'new-projects', label: 'New Projects', icon: Building2 },
  { id: 'add-new-project', label: 'Add New Project', icon: Plus },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'views', label: 'Analytics', icon: Eye },
]

const initialForm = { title: '', city: '', price: '', type: 'buy', category: '1BHK', propertyLabel: 'Normal', bedrooms: '', bathrooms: '', area: '', description: '', featured: false, advertised: false }
const initialNewProjectForm = { title: '', developer: '', location: '', priceRangeMin: '', priceRangeMax: '', status: 'Under Construction', towers: '', totalUnits: '', amenities: '', description: '' }

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [properties, setProperties] = useState([])
  const [leads, setLeads] = useState([])
  const [newProjects, setNewProjects] = useState([])
  const [form, setForm] = useState(initialForm)
  const [newProjectForm, setNewProjectForm] = useState(initialNewProjectForm)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [editingId, setEditingId] = useState('')
  const [editingNewProjectId, setEditingNewProjectId] = useState('')
  const [loginError, setLoginError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    // Independent fetches to ensure one failure doesn't block others
    try {
      const res = await propertyAPI.getAdminProperties({ limit: 200 })
      setProperties((res.properties || []).map(normalizeProperty))
    } catch (e) {
      console.error('Property fail:', e)
      setError(prev => prev + ' Properties: ' + (e.message || 'Error') + '. ')
    }

    try {
      const res = await leadAPI.getAll({ limit: 50 })
      setLeads(res.leads || [])
    } catch (e) {
      console.error('Leads fail:', e)
      setError(prev => prev + ' Leads: ' + (e.message || 'Error') + '. ')
    }

    try {
      const res = await newProjectAPI.getAll({ limit: 100 })
      setNewProjects(res.projects || [])
    } catch (e) {
      console.error('Projects fail:', e)
      setError(prev => prev + ' Projects: ' + (e.message || 'Error') + '. ')
    }
    
    setLoading(false)
  }

  useEffect(() => {
    if (!token) return
    loadData().catch((error) => {
      console.error('Admin load error:', error)
      if (error.message?.toLowerCase().includes('not authorized')) {
        localStorage.removeItem('token')
        setToken('')
      }
    })
  }, [token])

  const onLogin = async (e) => {
    e.preventDefault()
    try {
      setLoginError('')
      const data = await authAPI.login(credentials.email, credentials.password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      setToken(data.token)
    } catch (error) {
      setLoginError(error.message || 'Login failed')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    images.forEach((img) => fd.append('images', img))
    videos.forEach((video) => fd.append('videos', video))

    if (editingId) {
      await propertyAPI.update(editingId, fd)
      setSubmitSuccess('Property updated successfully!')
    } else {
      await propertyAPI.create(fd)
      setSubmitSuccess('Property added successfully!')
    }

    setForm(initialForm)
    setImages([])
    setVideos([])
    setEditingId('')
    await loadData()

    setTimeout(() => {
      setSubmitSuccess('')
      setActiveTab('properties')
    }, 2000)
  }

  const handleNewProjectSubmit = async (e) => {
    e.preventDefault()

    const fd = new FormData()
    // Append top-level fields
    Object.entries(newProjectForm).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(k, v)
      }
    })

    // Append images
    images.forEach((img) => fd.append('images', img))

    try {
      if (editingNewProjectId) {
        await newProjectAPI.update(editingNewProjectId, fd)
        toast.success('New Project updated successfully!')
        setSubmitSuccess('New Project updated successfully!')
      } else {
        await newProjectAPI.create(fd)
        toast.success('New Project published successfully!')
        setSubmitSuccess('New Project published successfully!')
      }

      setNewProjectForm(initialNewProjectForm)
      setEditingNewProjectId('')
      setImages([])
      setExistingImages([])
      await loadData()

      setTimeout(() => {
        setSubmitSuccess('')
        setActiveTab('new-projects')
      }, 2000)
    } catch (err) {
      toast.error(err.message || 'Error saving new project')
    }
  }

  const handleDeleteExistingImage = (publicId) => {
    // Note: In a real app, you might want to call an API to delete from Cloudinary immediately
    // or just filter it out and let the backend handle the update.
    // For now, we'll just remove it from the state and the user will click "Update"
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId))
  }

  const stats = useMemo(() => ([
    { label: 'Total Properties', value: properties.length, icon: Building2, change: '+0', color: 'text-amber-400' },
    { label: 'Total Leads', value: leads.length, icon: Users, change: '+0', color: 'text-green-400' },
    { label: 'Total Views', value: properties.reduce((a, p) => a + Number(p.views || 0), 0).toLocaleString(), icon: Eye, change: '+0', color: 'text-blue-400' },
    { label: 'Featured', value: properties.filter((p) => p.featured).length, icon: ArrowUpRight, change: '+0', color: 'text-purple-400' },
  ]), [properties, leads])

  if (!token) {
    return (
      <div className="min-h-screen pt-24 pb-20 max-w-md mx-auto px-4">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-2xl font-bold mb-4">Admin Login</h2>
          <form className="space-y-4" onSubmit={onLogin}>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <input type="email" required value={credentials.email} onChange={(e) => setCredentials((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
            <input type="password" required value={credentials.password} onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
            <button type="submit" className="btn-luxury w-full">Login</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Admin <span className="gradient-text">Panel</span></h1>
          <p className="text-white/40 mt-1">Manage properties, leads, and analytics</p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0"><div className="glass rounded-2xl p-3 flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'gradient-gold text-black' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><tab.icon size={18} />{tab.label}</button>)}</div></div>
          <div className="flex-1 min-w-0 space-y-6">
            {activeTab === 'dashboard' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((stat) => <div key={stat.label} className="glass rounded-2xl p-5"><stat.icon size={20} className={stat.color} /><p className="text-2xl font-bold mt-2">{stat.value}</p><p className="text-xs text-white/40 mt-1">{stat.label}</p></div>)}</div>}
            
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">{error}</div>}
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-white/40 text-sm">Loading data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'properties' && <PropertiesTable properties={properties} refresh={loadData} onEdit={(prop) => { setEditingId(prop.id); setForm({ ...initialForm, ...prop, city: prop.city || '', price: prop.priceNum || '' }); setExistingImages(prop.images || []); setActiveTab('add') }} />}
                {activeTab === 'new-projects' && <NewProjectsTable projects={newProjects} refresh={loadData} onEdit={(proj) => { setEditingNewProjectId(proj._id); setNewProjectForm({ ...initialNewProjectForm, ...proj, priceRangeMin: proj.priceRange?.min || '', priceRangeMax: proj.priceRange?.max || '', amenities: (proj.amenities || []).join(', ') }); setExistingImages(proj.images || []); setActiveTab('add-new-project') }} />}
              </>
            )}

            {activeTab === 'add' && <div className="glass rounded-2xl p-8"><h2 className="font-display text-2xl font-bold mb-6">{editingId ? 'Edit Property' : 'Add New Property'}</h2>{submitSuccess && <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium">{submitSuccess}</div>}<form className="space-y-6" onSubmit={handleSubmit}><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input required placeholder="Property title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><input required placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"><option value="buy" className="bg-gray-900">Buy</option><option value="rent" className="bg-gray-900">Rent</option></select><select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm">{['1BHK', '2BHK', '3BHK', '4BHK', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse'].map((c) => <option key={c} value={c} className="bg-gray-900">{c}</option>)}</select><select value={form.propertyLabel} onChange={(e) => setForm((p) => ({ ...p, propertyLabel: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"><option value="Normal" className="bg-gray-900">Normal</option><option value="Featured" className="bg-gray-900">Featured</option><option value="New Project" className="bg-gray-900">New Project</option></select></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><input type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => setForm((p) => ({ ...p, bedrooms: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><input type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => setForm((p) => ({ ...p, bathrooms: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><input type="number" placeholder="Area (sq ft)" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /></div><textarea required rows={4} placeholder="Property description..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none" /><div className="space-y-4"> {existingImages.length > 0 && <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">{existingImages.map((img, i) => <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10"><img src={typeof img === 'string' ? img : img.url} alt="" className="w-full h-full object-cover" /></div>)}</div>}<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors cursor-pointer"><Upload size={32} className="text-white/20 mx-auto mb-3" /><p className="text-white/50 text-sm">Upload images {images.length > 0 && `(${images.length} selected)`}</p><input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(Array.from(e.target.files || []))} /></label><label className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-amber-500/30 transition-colors cursor-pointer"><Upload size={24} className="text-white/20 mx-auto mb-2" /><p className="text-white/50 text-sm">Upload video</p><input type="file" accept="video/*" multiple className="hidden" onChange={(e) => setVideos(Array.from(e.target.files || []))} /></label></div></div><button type="submit" className="btn-luxury flex items-center gap-2"><Plus size={16} /> {editingId ? 'Update Property' : 'Add Property'}</button></form></div>}

            {activeTab === 'add-new-project' && <div className="glass rounded-2xl p-8"><h2 className="font-display text-2xl font-bold mb-6">{editingNewProjectId ? 'Edit New Project' : 'Add New Project'}</h2>{submitSuccess && <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium">{submitSuccess}</div>}<form className="space-y-6" onSubmit={handleNewProjectSubmit}><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input required placeholder="Project Title" value={newProjectForm.title} onChange={(e) => setNewProjectForm((p) => ({ ...p, title: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><input required placeholder="Developer Name" value={newProjectForm.developer} onChange={(e) => setNewProjectForm((p) => ({ ...p, developer: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /></div><div className="grid grid-cols-1 gap-4"><input required placeholder="Location" value={newProjectForm.location} onChange={(e) => setNewProjectForm((p) => ({ ...p, location: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><input required placeholder="Min Price (e.g. 1.2 Cr)" value={newProjectForm.priceRangeMin} onChange={(e) => setNewProjectForm((p) => ({ ...p, priceRangeMin: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><input required placeholder="Max Price (e.g. 5 Cr)" value={newProjectForm.priceRangeMax} onChange={(e) => setNewProjectForm((p) => ({ ...p, priceRangeMax: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><select value={newProjectForm.status} onChange={(e) => setNewProjectForm((p) => ({ ...p, status: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"><option value="Under Construction" className="bg-gray-900">Under Construction</option><option value="Ready to Move" className="bg-gray-900">Ready to Move</option><option value="Newly Launched" className="bg-gray-900">Newly Launched</option></select></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input type="number" placeholder="Total Towers" value={newProjectForm.towers} onChange={(e) => setNewProjectForm((p) => ({ ...p, towers: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><input type="number" placeholder="Total Units" value={newProjectForm.totalUnits} onChange={(e) => setNewProjectForm((p) => ({ ...p, totalUnits: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /></div><input placeholder="Amenities (comma separated)" value={newProjectForm.amenities} onChange={(e) => setNewProjectForm((p) => ({ ...p, amenities: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" /><textarea required rows={4} placeholder="Detailed Description..." value={newProjectForm.description} onChange={(e) => setNewProjectForm((p) => ({ ...p, description: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none" /><div className="space-y-4"> {existingImages.length > 0 && <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">{existingImages.map((img, i) => <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10"><img src={img.url || (typeof img === 'string' ? img : '')} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => handleDeleteExistingImage(img.publicId)} className="absolute top-1 right-1 w-6 h-6 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Trash2 size={12} /></button></div>)}</div>}<label className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors cursor-pointer block"><Upload size={32} className="text-white/20 mx-auto mb-3" /><p className="text-white/50 text-sm">Upload images {images.length > 0 && `(${images.length} selected)`}</p><input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(Array.from(e.target.files || []))} /></label></div><button type="submit" className="btn-luxury flex items-center gap-2 w-full justify-center"><Plus size={16} /> {editingNewProjectId ? 'Update Project' : 'Publish Project'}</button></form></div>}

            {activeTab === 'leads' && <div className="glass rounded-2xl p-6"><p className="text-white/60">Leads: {leads.length}</p></div>}
            {activeTab === 'views' && <div className="glass rounded-2xl p-6"><p className="text-white/60">Top viewed property: {[...properties].sort((a, b) => b.views - a.views)[0]?.title || 'N/A'}</p></div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function PropertiesTable({ properties, refresh, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('')
  const filtered = properties.filter((p) => String(p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(p.location || '').toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleFeatured = async (id) => { await propertyAPI.toggleFeatured(id); await refresh() }
  const toggleAd = async (id) => { await propertyAPI.toggleActive(id); await refresh() }
  const onDelete = async (id) => { await propertyAPI.delete(id); await refresh() }

  return (
    <div className="space-y-4">
      <div className="flex-1 flex items-center gap-2 glass rounded-xl px-4"><Search size={16} className="text-white/30" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search properties..." className="w-full bg-transparent outline-none text-sm text-white placeholder-white/30 py-3" /></div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-20 text-center">
              <Building2 size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/60 font-medium">No properties found</p>
              <p className="text-white/30 text-sm mt-1">Try a different search or add a new property</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/40 font-medium p-4">Property</th>
                  <th className="text-left text-xs text-white/40 font-medium p-4">Price</th>
                  <th className="text-center text-xs text-white/40 font-medium p-4">Featured</th>
                  <th className="text-center text-xs text-white/40 font-medium p-4">Active</th>
                  <th className="text-right text-xs text-white/40 font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prop) => {
                  try {
                    return <tr key={prop.id} className="border-b border-white/3 hover:bg-white/3 transition-colors"><td className="p-4"><div className="flex items-center gap-3"><img src={prop.images && prop.images.length > 0 ? (typeof prop.images[0] === 'string' ? prop.images[0] : prop.images[0].url) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100'} alt="" className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-medium text-sm">{prop.title}</p><p className="text-xs text-white/40">{prop.location}</p></div></div></td><td className="p-4 text-sm font-semibold gradient-text">{prop.price}</td><td className="p-4 text-center"><button onClick={() => toggleFeatured(prop.id)}>{prop.featured ? <ToggleRight size={24} className="text-amber-400" /> : <ToggleLeft size={24} className="text-white/20" />}</button></td><td className="p-4 text-center"><button onClick={() => toggleAd(prop.id)}>{prop.active ? <ToggleRight size={24} className="text-amber-400" /> : <ToggleLeft size={24} className="text-white/20" />}</button></td><td className="p-4"><div className="flex items-center justify-end gap-1"><button onClick={() => onEdit(prop)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-all"><Edit size={14} className="text-white/60" /></button><button onClick={() => onDelete(prop.id)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-red-500/10 transition-all"><Trash2 size={14} className="text-red-400/60" /></button></div></td></tr>;
                  } catch (err) {
                    console.error('Property map error:', err, prop);
                    return null;
                  }
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function NewProjectsTable({ projects, refresh, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('')
  const filtered = projects.filter((p) => String(p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(p.developer || '').toLowerCase().includes(searchTerm.toLowerCase()))

  const onDelete = async (id) => {
    if (window.confirm('Delete this new project?')) {
      await newProjectAPI.delete(id);
      await refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex-1 flex items-center gap-2 glass rounded-xl px-4"><Search size={16} className="text-white/30" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search new projects..." className="w-full bg-transparent outline-none text-sm text-white placeholder-white/30 py-3" /></div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-20 text-center">
              <Building2 size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/60 font-medium">No new projects found</p>
              <p className="text-white/30 text-sm mt-1">Add your first project to see it here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/40 font-medium p-4">Project</th>
                  <th className="text-left text-xs text-white/40 font-medium p-4">Developer</th>
                  <th className="text-center text-xs text-white/40 font-medium p-4">Status</th>
                  <th className="text-right text-xs text-white/40 font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => <tr key={proj._id} className="border-b border-white/3 hover:bg-white/3 transition-colors"><td className="p-4"><div className="flex items-center gap-3"><img src={proj.images?.[0]?.url || (typeof proj.images?.[0] === 'string' ? proj.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100')} alt="" className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-medium text-sm">{proj.title}</p><p className="text-xs text-white/40">{proj.location}</p></div></div></td><td className="p-4 text-sm font-semibold">{proj.developer}</td><td className="p-4 text-center"><span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{proj.status}</span></td><td className="p-4"><div className="flex items-center justify-end gap-1"><button onClick={() => onEdit(proj)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-all"><Edit size={14} className="text-white/60" /></button><button onClick={() => onDelete(proj._id)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-red-500/10 transition-all"><Trash2 size={14} className="text-red-400/60" /></button></div></td></tr>)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
