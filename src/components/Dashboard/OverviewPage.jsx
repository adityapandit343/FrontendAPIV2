import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tenantApi, qnaApi } from '../../services/api';
import { BookOpen, Smartphone, Key, CheckCircle, XCircle } from 'lucide-react';
import ChatPreview from '../Chat/ChatPreview';

export default function OverviewPage() {
  const [tenant, setTenant] = useState(null);
  const [qnaCount, setQnaCount] = useState(0);

  useEffect(() => {
    Promise.all([tenantApi.getMe(), qnaApi.getAll()]).then(([t, q]) => {
      setTenant(t.data);
      setQnaCount(q.data.length);
    });
  }, []);

  if (!tenant) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-zinc-400 text-sm">Overview of your chatbot system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-brand-400" />}
          label="Q&A Pairs"
          value={qnaCount}
          action={<Link to="/dashboard/qna" className="text-brand-400 hover:underline text-xs">Manage →</Link>}
        />
        <StatCard
          icon={<Smartphone className="w-5 h-5 text-green-400" />}
          label="WhatsApp"
          value={tenant.isWhatsAppConnected ? 'Connected' : 'Not Connected'}
          valueClass={tenant.isWhatsAppConnected ? 'text-green-400' : 'text-red-400'}
          action={<Link to="/dashboard/whatsapp" className="text-brand-400 hover:underline text-xs">Configure →</Link>}
          icon2={tenant.isWhatsAppConnected
            ? <CheckCircle className="w-4 h-4 text-green-400" />
            : <XCircle className="w-4 h-4 text-red-400" />}
        />
        <StatCard
          icon={<Key className="w-5 h-5 text-amber-400" />}
          label="API Key"
          value={`${tenant.apiKey.substring(0, 8)}…`}
          valueClass="font-mono text-sm"
          action={<Link to="/dashboard/settings" className="text-brand-400 hover:underline text-xs">Settings →</Link>}
        />
      </div>

      {/* Live preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Live Chat Preview</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Test your Q&A pairs in real-time. This is exactly what your visitors will see.
          </p>
          <ChatPreview />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
          <div className="card space-y-3">
            {[
              { step: '1', title: 'Add Q&A pairs', desc: 'Go to Q&A Pairs and add your questions and answers.', to: '/dashboard/qna' },
              { step: '2', title: 'Connect WhatsApp', desc: 'Scan the QR code to link your WhatsApp Business number.', to: '/dashboard/whatsapp' },
              { step: '3', title: 'Embed widget', desc: 'Copy your API key and embed the chat widget on your website.', to: '/dashboard/settings' },
            ].map(({ step, title, desc, to }) => (
              <Link key={step} to={to}
                className="flex gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors group">
                <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-400">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-brand-300 transition-colors">{title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, valueClass = '', action, icon2 }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-zinc-400">{label}</span>
        </div>
        {icon2}
      </div>
      <p className={`text-2xl font-bold mb-2 ${valueClass}`}>{value}</p>
      {action}
    </div>
  );
}
