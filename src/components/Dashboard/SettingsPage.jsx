import { useEffect, useState } from 'react';
import { tenantApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Copy, RefreshCw, Check } from 'lucide-react';
import ChatPreview from '../Chat/ChatPreview';

export default function SettingsPage() {
  const [tenant, setTenant] = useState(null);
  const [form, setForm] = useState({ tenantName: '', whatsAppPhoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [regen, setRegen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    tenantApi.getMe().then(({ data }) => {
      setTenant(data);
      setForm({ tenantName: data.tenantName, whatsAppPhoneNumber: data.whatsAppPhoneNumber });
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await tenantApi.updateMe(form);
      setTenant(data);
      toast.success('Saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const regenKey = async () => {
    if (!confirm('Regenerate your API key? Any existing integrations will need to be updated.')) return;
    setRegen(true);
    try {
      const { data } = await tenantApi.regenerateKey();
      setTenant(t => ({ ...t, apiKey: data.apiKey }));
      toast.success('New API key generated!');
    } catch { toast.error('Failed'); }
    finally { setRegen(false); }
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!tenant) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const embedSnippet = `<script src="https://yourcdn.com/chatbot-widget.js"
  data-api-key="${tenant.apiKey}"
  data-api-url="https://yourapi.com/api">
</script>`;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-zinc-400 text-sm">Manage your account and integration settings</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Business Name</label>
            <input value={form.tenantName} onChange={e => setForm(f => ({ ...f, tenantName: e.target.value }))}
              className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input value={tenant.email} disabled className="input opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">WhatsApp Number</label>
            <input value={form.whatsAppPhoneNumber}
              onChange={e => setForm(f => ({ ...f, whatsAppPhoneNumber: e.target.value }))}
              className="input" placeholder="+1234567890" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={saveProfile} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* API Key */}
      <div className="card">
        <h2 className="font-semibold mb-1">API Key</h2>
        <p className="text-sm text-zinc-400 mb-4">Use this key to embed the chat widget on your website.</p>
        <div className="flex gap-2">
          <code className="flex-1 input font-mono text-sm text-brand-300 truncate select-all">
            {tenant.apiKey}
          </code>
          <button onClick={() => copy(tenant.apiKey)}
            className="btn-secondary flex items-center gap-1.5 px-3 flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={regenKey} disabled={regen}
            className="btn-secondary flex items-center gap-1.5 px-3 flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${regen ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Embed snippet */}
      <div className="card">
        <h2 className="font-semibold mb-1">Embed Widget</h2>
        <p className="text-sm text-zinc-400 mb-4">Add this snippet before the closing &lt;/body&gt; tag on your website.</p>
        <div className="relative">
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre">
            {embedSnippet}
          </pre>
          <button onClick={() => copy(embedSnippet)}
            className="absolute top-2 right-2 btn-secondary px-2 py-1 text-xs flex items-center gap-1">
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
      </div>

      {/* Chat preview */}
      <div className="card">
        <h2 className="font-semibold mb-1">Widget Preview</h2>
        <p className="text-sm text-zinc-400 mb-4">Test your Q&A pairs. This is how visitors interact with your bot.</p>
        <ChatPreview />
      </div>
    </div>
  );
}
