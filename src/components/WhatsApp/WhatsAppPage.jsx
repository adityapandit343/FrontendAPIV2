import { useEffect, useState, useRef, useCallback } from 'react';
import { tenantApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Smartphone, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const STATUS_LABELS = {
  not_configured: { text: 'Not configured', color: 'text-zinc-400', dot: 'bg-zinc-600' },
  pending: { text: 'Initializing…', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  awaiting_scan: { text: 'Scan QR code', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  reconnecting: { text: 'Reconnecting…', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  connected: { text: 'Connected', color: 'text-green-400', dot: 'bg-green-400' },
  disconnected: { text: 'Disconnected', color: 'text-red-400', dot: 'bg-red-400' },
  error: { text: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
};

export default function WhatsAppPage() {
  const [tenant, setTenant] = useState(null);
  const [status, setStatus] = useState('not_configured');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const pollRef = useRef(null);

  const loadTenant = async () => {
    const { data } = await tenantApi.getMe();
    setTenant(data);
    setStatus(data.isWhatsAppConnected ? 'connected' : 'not_configured');
  };

  useEffect(() => { loadTenant(); return () => stopPolling(); }, []);

  const stopPolling = () => { if (pollRef.current) clearInterval(pollRef.current); };

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await tenantApi.getWhatsAppStatus();
        setStatus(data.status);
        if (data.qrCode) setQrCode(data.qrCode);

        if (data.status === 'connected') {
          setQrCode(null);
          stopPolling();
          toast.success('WhatsApp connected!');
          loadTenant();
        }
        if (data.status === 'disconnected' || data.status === 'error') {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    }, 2500);
  }, []);

  const connect = async () => {
    setLoading(true);
    setQrCode(null);
    setStatus('pending');
    try {
      const { data } = await tenantApi.connectWhatsApp();
      if (data.qrCode) setQrCode(data.qrCode);
      setStatus(data.status || 'awaiting_scan');
      startPolling();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection failed');
      setStatus('error');
    } finally { setLoading(false); }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    stopPolling();
    try {
      await tenantApi.disconnectWhatsApp();
      setStatus('not_configured');
      setQrCode(null);
      toast.success('Disconnected');
      loadTenant();
    } catch { toast.error('Disconnect failed'); }
    finally { setDisconnecting(false); }
  };

  const s = STATUS_LABELS[status] || STATUS_LABELS.not_configured;
  const isConnected = status === 'connected';
  const isActive = ['pending', 'awaiting_scan', 'reconnecting'].includes(status);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">WhatsApp Connection</h1>
        <p className="text-zinc-400 text-sm">Connect your WhatsApp Business number to enable automated replies.</p>
      </div>

      {/* Status card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              ${isConnected ? 'bg-green-500/10 border border-green-500/20' : 'bg-zinc-800'}`}>
              {isConnected
                ? <Wifi className="w-5 h-5 text-green-400" />
                : <WifiOff className="w-5 h-5 text-zinc-400" />}
            </div>
            <div>
              <p className="font-medium text-sm">
                {tenant?.whatsAppPhoneNumber || 'Not configured'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className={`text-xs ${s.color}`}>{s.text}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isConnected ? (
              <button onClick={disconnect} disabled={disconnecting} className="btn-danger text-sm">
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            ) : (
              <button onClick={connect} disabled={loading || isActive}
                className="btn-primary flex items-center gap-2 text-sm">
                {(loading || isActive) && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isActive ? 'Connecting…' : 'Connect WhatsApp'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      {qrCode && !isConnected && (
        <div className="card text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-sm font-medium text-amber-400">Waiting for scan…</p>
          </div>
          <div className="inline-block p-4 bg-white rounded-xl mb-4">
            <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56" />
          </div>
          <div className="text-sm text-zinc-400 space-y-1">
            <p className="font-medium text-zinc-200">How to connect:</p>
            <ol className="text-left inline-block space-y-1 text-sm">
              <li>1. Open WhatsApp on your phone</li>
              <li>2. Tap Menu (⋮) → Linked devices</li>
              <li>3. Tap "Link a device"</li>
              <li>4. Scan this QR code</li>
            </ol>
          </div>
          <p className="text-xs text-zinc-600 mt-3">QR code expires in ~60 seconds</p>
        </div>
      )}

      {/* Connected state */}
      {isConnected && (
        <div className="card text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="font-semibold text-lg">WhatsApp Connected!</p>
          <p className="text-zinc-400 text-sm mt-1">
            Your chatbot is now active on <span className="text-zinc-200">{tenant?.whatsAppPhoneNumber}</span>
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="card mt-6">
        <h3 className="font-semibold text-sm mb-3">How it works</h3>
        <div className="space-y-2 text-sm text-zinc-400">
          <p>1. WhatsApp messages sent to your number are received by the Node.js bridge service.</p>
          <p>2. The bridge calls the .NET webhook, which matches the message to your Q&A pairs.</p>
          <p>3. The matched answer is returned to the bridge, which sends the reply to the user.</p>
          <p>4. If no match is found, the fallback message is sent automatically.</p>
        </div>
      </div>
    </div>
  );
}
