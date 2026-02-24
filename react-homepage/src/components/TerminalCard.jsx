import { useEffect, useRef, useState } from 'react';

const PALETTE = {
  green:  '#a6e3a1',
  blue:   '#89b4fa',
  gray:   '#585b70',
  dim:    '#45475a',
  text:   '#cdd6f4',
  red:    '#f38ba8',
  yellow: '#f9e2af',
};

const LINES = [
  { type: 'cmd', prompt: { user: 'alex', host: 'vps-prod', dir: '~' }, text: 'bash deploy.sh' },
  { type: 'out', text: '[1/5] Pulling latest code...',                       color: PALETTE.dim },
  { type: 'out', text: '  ✓ Already up to date.',                            color: PALETTE.green },
  { type: 'out', text: '[2/5] Installing dependencies...',                   color: PALETTE.dim },
  { type: 'out', text: '  npm warn deprecated inflight@1.0.6',               color: PALETTE.yellow },
  { type: 'out', text: '  npm warn deprecated rimraf@2.7.1',                 color: PALETTE.yellow },
  { type: 'out', text: '  added 847 packages in 41s',                        color: PALETTE.dim },
  { type: 'out', text: '[3/5] Building application...',                      color: PALETTE.dim },
  { type: 'out', text: '  ✗ FATAL ERROR: CALL_AND_RETRY_LAST',               color: PALETTE.red },
  { type: 'out', text: '    JavaScript heap out of memory',                  color: PALETTE.red },
  { type: 'out', text: '  Retrying with --max-old-space-size=512...',        color: PALETTE.yellow },
  { type: 'out', text: '  ✗ Build failed. Exit code 1',                      color: PALETTE.red },
  { type: 'out', text: '[4/5] Reloading nginx...',                           color: PALETTE.dim },
  { type: 'out', text: '  ✗ [emerg] unknown directive "ssl_stapling"',       color: PALETTE.red },
  { type: 'out', text: '    /etc/nginx/sites-enabled/myapp.conf:23',         color: PALETTE.dim },
  { type: 'out', text: '[5/5] Renewing SSL certificate...',                  color: PALETTE.dim },
  { type: 'out', text: '  ✗ Challenge failed for myapp.com',                 color: PALETTE.red },
  { type: 'out', text: '    Port 80 in use — is nginx running?',             color: PALETTE.yellow },
  { type: 'out', text: '',                                                    color: PALETTE.dim },
  { type: 'out', text: '❌ Deploy failed. See /var/log/deploy.log',           color: PALETTE.red },
  { type: 'cmd', prompt: { user: 'alex', host: 'vps-prod', dir: '~' }, text: '', final: true },
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export default function TerminalCard() {
  // Pre-fill all slots — card height is fixed from first render
  const [lines, setLines] = useState(LINES.map(() => ({ text: '', done: false })));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [blink, setBlink] = useState(true);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    let timer;

    async function run() {
      await new Promise(r => { timer = setTimeout(r, 500); });

      for (let i = 0; i < LINES.length; i++) {
        if (cancelled.current) return;
        const full = LINES[i].text;

        setActiveIdx(i);

        for (let c = 0; c <= full.length; c++) {
          if (cancelled.current) return;
          const delay = LINES[i].type === 'cmd' ? rand(40, 90) : rand(12, 40);
          await new Promise(r => { timer = setTimeout(r, delay); });
          setLines(prev => {
            const next = [...prev];
            next[i] = { text: full.slice(0, c), done: false };
            return next;
          });
        }

        setLines(prev => {
          const next = [...prev];
          next[i] = { ...next[i], done: true };
          return next;
        });

        const pause = LINES[i].type === 'cmd' ? 350 : 60;
        await new Promise(r => { timer = setTimeout(r, pause); });
      }
    }

    run();
    return () => { cancelled.current = true; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  const showCursorOnLine = (i) => {
    if (i !== activeIdx) return false;
    return !lines[i]?.done || LINES[i]?.final;
  };

  return (
    <div style={{
      background: '#11111b',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '0.75rem',
      width: '100%',
      maxWidth: '440px',
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      fontSize: '12px',
      lineHeight: '1.6',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE.red,    flexShrink: 0 }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE.yellow, flexShrink: 0 }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE.green,  flexShrink: 0 }} />
        <span style={{ marginLeft: 8, fontSize: 10, color: PALETTE.gray }}>vps-prod — bash</span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        {LINES.map((spec, i) => {
          const line = lines[i] || { text: '', done: false };
          const isCmd = spec.type === 'cmd';
          const color = isCmd ? PALETTE.text : (spec.color || PALETTE.text);

          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1px', minHeight: '1.4em' }}>
              {isCmd && (
                <span style={{ marginRight: 4, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ color: PALETTE.green }}>{spec.prompt.user}@{spec.prompt.host}</span>
                  <span style={{ color: PALETTE.gray }}>:</span>
                  <span style={{ color: PALETTE.blue }}>{spec.prompt.dir}</span>
                  <span style={{ color: PALETTE.gray }}> $ </span>
                </span>
              )}
              <span style={{ color, wordBreak: 'break-all' }}>
                {line.text}
                {showCursorOnLine(i) && (
                  <span style={{
                    display: 'inline-block',
                    width: 7, height: '0.85em',
                    background: PALETTE.text,
                    verticalAlign: '-0.08em',
                    marginLeft: 1,
                    opacity: blink ? 1 : 0,
                  }} />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
