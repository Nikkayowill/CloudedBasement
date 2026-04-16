import { useState, useEffect, useRef } from 'react';

function SectionHeader({ title }) {
  return (
    <div className="border-b-faint" style={{ padding: '1.5rem 1.5rem 1rem' }}>
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dash-text-muted, #525252)' }}>
        {title}
      </h2>
    </div>
  );
}

function repoLabel(gitUrl = '') {
  return gitUrl.split('/').pop().replace(/\.git$/, '') || gitUrl;
}

const DEMO_LINES = [
  { type: 'info', text: 'Connected — streaming my-saas-app.service' },
  { type: 'log',  text: '2026-04-16T14:22:01Z basement systemd[1]: Started my-saas-app.service.' },
  { type: 'log',  text: '2026-04-16T14:22:01Z basement node[2814]: Server listening on port 3000' },
  { type: 'log',  text: '2026-04-16T14:22:02Z basement node[2814]: Database connected' },
  { type: 'log',  text: '2026-04-16T14:22:15Z basement node[2814]: GET / 200 12ms' },
  { type: 'log',  text: '2026-04-16T14:22:16Z basement node[2814]: GET /api/health 200 3ms' },
  { type: 'log',  text: '2026-04-16T14:23:04Z basement node[2814]: POST /api/users 201 45ms' },
  { type: 'log',  text: '2026-04-16T14:23:44Z basement node[2814]: GET /dashboard 200 8ms' },
  { type: 'log',  text: '2026-04-16T14:25:11Z basement node[2814]: GET /api/health 200 2ms' },
];

export default function LogsSection({ data }) {
  const { deployments = [], hasServer, serverStatus, isDemo } = data;

  const successfulDeps = deployments.filter(d => d.status === 'success' && d.git_url);

  const [selectedId, setSelectedId] = useState(() => successfulDeps[0]?.id ?? null);
  const [lines, setLines]           = useState([]);
  const [connected, setConnected]   = useState(false);
  const [streaming, setStreaming]   = useState(false);

  const esRef      = useRef(null);
  const bottomRef  = useRef(null);
  const autoScroll = useRef(true);


  // Track demo timer and running state
  const demoTimerRef = useRef(null);
  const demoRunningRef = useRef(false);

  const stop = () => {
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
    demoRunningRef.current = false;
    esRef.current?.close();
    esRef.current = null;
    setStreaming(false);
    setConnected(false);
  };

  const start = () => {
    if (!selectedId) return;
    stop();
    setLines([]);
    setStreaming(true);

    // Demo mode — replay fake lines without a real SSH connection
    if (isDemo) {
      setConnected(true);
      let i = 0;
      demoRunningRef.current = true;
      const tick = () => {
        if (!demoRunningRef.current) return;
        if (i < DEMO_LINES.length) {
          const line = { ...DEMO_LINES[i], id: Date.now() + i };
          setLines(prev => [...prev, line]);
          i++;
          esRef.current = { close: () => {} };
          demoTimerRef.current = setTimeout(tick, 180);
        } else {
          demoTimerRef.current = null;
        }
      };
      tick();
      return;
    }

    const es = new EventSource(`/logs/stream?deploymentId=${selectedId}`, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const { type, text } = JSON.parse(e.data);
        setLines(prev => [...prev.slice(-2000), { type, text, id: Date.now() + Math.random() }]);
        if (type === 'info' && text.startsWith('Connected')) setConnected(true);
        if (type === 'error') { setConnected(false); setStreaming(false); }
      } catch (_) {}
    };

    es.onerror = () => {
      setConnected(false);
      setStreaming(false);
      es.close();
    };
  };

  // Stop stream when unmounting or switching deployments
  useEffect(() => () => stop(), []);

  // Auto-scroll to bottom unless user has scrolled up
  useEffect(() => {
    if (autoScroll.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const lineColor = (type) => {
    if (type === 'error') return '#f87171';
    if (type === 'info')  return '#60a5fa';
    return '#a1a1a1';
  };

  if (!hasServer || serverStatus !== 'running') {
    return (
      <section>
        <SectionHeader title="Logs" />
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--dash-text-muted, #525252)', fontSize: '0.8125rem' }}>
          No running server.
        </div>
      </section>
    );
  }

  if (successfulDeps.length === 0) {
    return (
      <section>
        <SectionHeader title="Logs" />
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--dash-text-muted, #525252)', fontSize: '0.8125rem' }}>
          No successful deployments yet. Deploy an app to stream its logs.
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Logs" />

      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select
            value={selectedId ?? ''}
            onChange={e => { stop(); setLines([]); setSelectedId(Number(e.target.value)); }}
            style={{
              flex: 1, minWidth: 0, maxWidth: '20rem',
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.375rem', color: '#fafafa',
              padding: '0.375rem 0.625rem', fontSize: '0.8125rem',
            }}
          >
            {successfulDeps.map(d => (
              <option key={d.id} value={d.id}>
                {repoLabel(d.git_url)}{d.branch ? ` (${d.branch})` : ''}{d.is_preview ? ' [preview]' : ''}
              </option>
            ))}
          </select>

          {!streaming ? (
            <button onClick={start} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.375rem', background: '#2563eb', border: 'none', color: '#fff', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
              Stream Logs
            </button>
          ) : (
            <button onClick={stop} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.375rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
              Stop
            </button>
          )}

          {/* Status dot */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: connected ? '#22c55e' : streaming ? '#eab308' : '#525252' }}>
            <span style={{ width: '0.4375rem', height: '0.4375rem', borderRadius: '50%', background: 'currentColor' }} />
            {connected ? 'Live' : streaming ? 'Connecting…' : 'Disconnected'}
          </span>

          {lines.length > 0 && (
            <button onClick={() => setLines([])} style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem', borderRadius: '0.3125rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#525252', fontSize: '0.6875rem', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>

        {/* Terminal */}
        <div
          onScroll={e => {
            const el = e.currentTarget;
            autoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          }}
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            height: '28rem',
            overflowY: 'auto',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            lineHeight: 1.6,
          }}
        >
          {lines.length === 0 && !streaming && (
            <span style={{ color: '#525252' }}>Select a deployment and click "Stream Logs" to begin.</span>
          )}
          {lines.length === 0 && streaming && (
            <span style={{ color: '#60a5fa' }}>Connecting…</span>
          )}
          {lines.map(l => (
            <div key={l.id} style={{ color: lineColor(l.type), wordBreak: 'break-all' }}>
              {l.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  );
}
