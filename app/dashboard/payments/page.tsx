'use client'
// app/dashboard/payments/page.tsx
import { useState, useEffect } from 'react'
import { Save, ExternalLink } from 'lucide-react'

export default function PaymentsPage() {
  const [keys, setKeys] = useState({ keyId: '', webhookSecret: '' })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [orders, setOrders] = useState<{ id: string; amount: number; service: string; date: string }[]>([])

  // In production: fetch payment history from your Firestore `payments` collection
  useEffect(() => {
    // Placeholder — wire up to /api/payments/history when ready
    setOrders([])
  }, [])

  const save = async () => {
    setSaving(true)
    // Store Razorpay key ID (never secret) in profile for frontend use
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpayKeyId: keys.keyId }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = 'w-full bg-[#13131a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#7ef0c8]/40 font-mono'

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-syne text-2xl font-bold text-white mb-1">Payments</h1>
        <p className="text-white/40 text-sm">Razorpay integration for your service bookings</p>
      </div>

      <div className="space-y-5">

        {/* Setup guide */}
        <div className="bg-[#7ef0c8]/[0.05] border border-[#7ef0c8]/20 rounded-2xl p-5">
          <h2 className="font-syne font-semibold text-[#7ef0c8] mb-2">Setup Guide</h2>
          <ol className="text-white/50 text-sm space-y-1.5 list-decimal list-inside">
            <li>Create a <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-[#7ef0c8] hover:underline">Razorpay account</a></li>
            <li>Go to Settings → API Keys → Generate Test Key</li>
            <li>Copy your Key ID and Secret into <code className="bg-white/10 px-1 rounded">.env.local</code></li>
            <li>Add <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> for the frontend</li>
            <li>Add <code className="bg-white/10 px-1 rounded">RAZORPAY_KEY_SECRET</code> for the backend (server only)</li>
          </ol>
        </div>

        {/* Key config */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="font-syne font-semibold text-white mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Razorpay Key ID <span className="text-white/25">(safe for frontend)</span></label>
              <input
                value={keys.keyId}
                onChange={e => setKeys(k => ({ ...k, keyId: e.target.value }))}
                placeholder="rzp_test_..."
                className={inputClass}
              />
            </div>
            <p className="text-white/25 text-xs">
              ⚠️ Never paste your Key Secret here. It must stay in <code>.env.local</code> on the server only.
            </p>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-[#7ef0c8] text-[#0a0a0f] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-[#5dd4aa] transition-colors disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Key ID'}
            </button>
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-semibold text-white">Recent Orders</h2>
            <a
              href="https://dashboard.razorpay.com/app/orders"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Razorpay Dashboard <ExternalLink size={12} />
            </a>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/20 text-sm">No payments yet. Activate a service to start earning.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs border-b border-white/[0.06]">
                  <th className="text-left pb-3 font-normal">Order ID</th>
                  <th className="text-left pb-3 font-normal">Service</th>
                  <th className="text-right pb-3 font-normal">Amount</th>
                  <th className="text-right pb-3 font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-white/[0.04]">
                    <td className="py-3 text-white/50 font-mono text-xs">{o.id}</td>
                    <td className="py-3 text-white/70">{o.service}</td>
                    <td className="py-3 text-[#7ef0c8] text-right font-syne font-bold">₹{o.amount}</td>
                    <td className="py-3 text-white/30 text-right text-xs">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}