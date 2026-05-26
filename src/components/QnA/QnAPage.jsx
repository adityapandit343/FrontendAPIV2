import { useEffect, useState } from 'react';
import { qnaApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, Search, ToggleLeft, ToggleRight } from 'lucide-react';

export default function QnAPage() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await qnaApi.getAll();
      setPairs(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = pairs.filter(p =>
    p.question.toLowerCase().includes(search.toLowerCase()) ||
    p.answer.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditId(null); setForm({ question: '', answer: '' }); setShowForm(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ question: p.question, answer: p.answer, isActive: p.isActive }); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditId(null); };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast.error('Both fields required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await qnaApi.update(editId, { ...form, isActive: form.isActive ?? true });
        setPairs(p => p.map(x => x.id === editId ? data : x));
        toast.success('Updated!');
      } else {
        const { data } = await qnaApi.create(form);
        setPairs(p => [data, ...p]);
        toast.success('Created!');
      }
      cancelForm();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try {
      await qnaApi.delete(id);
      setPairs(p => p.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const toggleActive = async (p) => {
    try {
      const { data } = await qnaApi.update(p.id, { question: p.question, answer: p.answer, isActive: !p.isActive });
      setPairs(prev => prev.map(x => x.id === p.id ? data : x));
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Q&A Pairs</h1>
          <p className="text-zinc-400 text-sm">{pairs.length} total · {pairs.filter(p => p.isActive).length} active</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Pair
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Q&A Pair' : 'New Q&A Pair'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Question</label>
                <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  className="input" placeholder="e.g. What are your business hours?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Answer</label>
                <textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  className="input resize-none" rows={4}
                  placeholder="e.g. We're open Monday to Friday, 9am–6pm." />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={cancelForm} className="btn-secondary flex items-center gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input pl-9" placeholder="Search questions and answers…" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-zinc-400 mb-3">{search ? 'No results found' : 'No Q&A pairs yet'}</p>
          {!search && <button onClick={openCreate} className="btn-primary">Add your first pair</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className={`card py-4 transition-all ${!p.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-zinc-100 mb-1 truncate">
                    {p.question}
                  </p>
                  <p className="text-sm text-zinc-400 line-clamp-2">{p.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(p)} title={p.isActive ? 'Disable' : 'Enable'}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100">
                    {p.isActive
                      ? <ToggleRight className="w-4 h-4 text-brand-400" />
                      : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => del(p.id)} disabled={deleting === p.id}
                    className="p-1.5 rounded-lg hover:bg-red-950 transition-colors text-zinc-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
