import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    tenantName: '', email: '', password: '', whatsAppPhoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please sign in.');
      nav('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nexus Admin</span>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold mb-1">Create account</h1>
          <p className="text-zinc-400 text-sm mb-6">Set up your multi-tenant Nexus</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Business Name</label>
              <input name="tenantName" value={form.tenantName} onChange={handle}
                className="input" placeholder="Acme Corp" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="input" placeholder="Min. 8 characters" minLength={8} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                WhatsApp Business Number
              </label>
              <input name="whatsAppPhoneNumber" value={form.whatsAppPhoneNumber} onChange={handle}
                className="input" placeholder="+1234567890 (E.164 format)" required />
              <p className="text-xs text-zinc-500 mt-1">Include country code, e.g. +1234567890</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
