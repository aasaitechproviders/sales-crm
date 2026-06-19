import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import Spinner from '../../components/Spinner'

const TOWNS = ['Kallakurichi','Tirukoilur','Ulundurpet','Chinnasalem','Sankarapuram','Manalurpet','Thiyagadurgam','Mungilthuraipattu','Vanapuram','Rishivandiyam','Vadakkanandal','Kachirayapalayam']
const CATS  = ['Fashion & Apparel','Beauty & Bridal','Jewellery','Footwear','Fashion Support']
const SUBCATS = ['Boutique','Designer Boutique','Saree Shop','Textile Showroom','Readymade Garment Store','Fashion Store','Bridal Wear Store','Womens Wear Store','Mens Wear Store','Kids Wear Store','Beauty Parlour','Bridal Studio','Makeup Studio','Wedding Makeup Artist','Gold Jewellery Store','Diamond Jewellery Store','Bridal Jewellery Store','Silver Jewellery Store','Footwear Store','Branded Footwear Store','Shoe Store','Accessories Store','Fancy Store','Handbag Store','Tailoring Shop','Fashion Designer']
const TIERS = ['Tier A','Tier B','Tier C']

export default function NewLead() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ businessName:'', phone:'', town:'', district:'Kallakurichi', category:'', subCategory:'', address:'', whatsapp:'', priorityTier:'Tier C' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const submit = async () => {
    if (!form.businessName.trim()) { setError('Business name required'); return }
    if (!form.phone.trim())        { setError('Phone number required'); return }
    if (!form.town)                { setError('Select a town'); return }
    if (!form.category)            { setError('Select a category'); return }
    setError(''); setSubmitting(true)
    try {
      const d = await api.createLead(form)
      navigate(`/leads/${d.lead._id}`, { replace: true })
    } catch(e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  const Field = ({ label, required, children }) => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )

  const inp = "w-full bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
  const sel = "w-full bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 appearance-none"

  return (
    <div className="px-4 py-4 pb-8">
      <button onClick={() => navigate(-1)} className="text-[#7070a0] text-sm mb-3">← Back</button>
      <h1 className="font-bold text-lg mb-5">Add New Lead</h1>

      <Field label="Business Name" required>
        <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
          placeholder="Store / boutique name" className={inp} />
      </Field>

      <Field label="Phone" required>
        <input value={form.phone} onChange={e => set('phone', e.target.value)}
          placeholder="Mobile number" type="tel" inputMode="numeric" className={inp} />
      </Field>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Town <span className="text-red-400">*</span></label>
          <select value={form.town} onChange={e => set('town', e.target.value)} className={sel}>
            <option value="">Select town</option>
            {TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">District</label>
          <input value={form.district} onChange={e => set('district', e.target.value)} className={inp} />
        </div>
      </div>

      <Field label="Category" required>
        <select value={form.category} onChange={e => set('category', e.target.value)} className={sel}>
          <option value="">Select category</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Sub Category">
        <select value={form.subCategory} onChange={e => set('subCategory', e.target.value)} className={sel}>
          <option value="">Select sub-category</option>
          {SUBCATS.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>

      <Field label="Priority Tier">
        <div className="flex gap-2">
          {TIERS.map(t => (
            <button key={t} onClick={() => set('priorityTier', t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${form.priorityTier===t ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-[#111118] border-[#1e1e28] text-[#9090b0]'}`}>
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Address">
        <textarea value={form.address} onChange={e => set('address', e.target.value)}
          placeholder="Full address" rows={2} className={inp + " resize-none"} />
      </Field>

      <Field label="WhatsApp">
        <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
          placeholder="WhatsApp number" type="tel" inputMode="numeric" className={inp} />
      </Field>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

      <button onClick={submit} disabled={submitting}
        className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl text-base active:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting ? <><Spinner size="sm" /> Saving...</> : '+ Create Lead'}
      </button>
    </div>
  )
}