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
  { type: 'cmd',  prompt: { user: 'alex', host: 'macbook', dir: '~/my-app' }, text: 'git push cb main' },
  { type: 'out',  text: '> Connecting to Clouded Basement...', color: PALETTE.dim },
  { type: 'out',  text: '✓ Auth OK',                           color: PALETTE.green },
  { type: 'out',  text: '> Uploading repository...',           color: PALETTE.dim },
  { type: 'out',  text: '✓ Transfer complete (1.2 MB)',        color: PALETTE.green },
  { type: 'out',  text: '> Installing dependencies...',        color: PALETTE.dim },
  { type: 'out',  text: '✓ npm install complete',              color: PALETTE.green },
  { type: 'out',  text: '> Building project...',               color: PALETTE.dim },
  { type: 'out',  text: '✓ Build successful',                  color: PALETTE.green },
  { type: 'out',  text: '> Starting server...',                color: PALETTE.dim },
  { type: 'out',  text: '✓ Live at https://myapp.cb.dev',      color: PALETTE.blue },
  { type: 'out',  text: '',                                     color: PALETTE.text },
  { type: 'out',  text: '  Deploy time: 18s',                  color: PALETTE.dim },
  { type: 'cmd',  prompt: { user: 'alex', host: 'macbook', dir: '~/my-app' }, text: '', final: true },
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export default function TerminalCard() {
  // lines[i] = { text: string, done: boolean }
  const [lines, setLines] = useState([]);
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

        // Push empty line
        setLines(prev => [...prev, { text: '', done: false }]);

        // Type each character
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

        // Mark done
        setLines(prev => {
          const next = [...prev];
          next[i] = { ...next[i], done: true };
          return next;
        });

        // Pause between lines
        const pause = LINES[i].type === 'cmd' ? 350 : 60;
        await new Promise(r => { timer = setTimeout(r, pause); });
      }
    }

    run();
    return () => {
      cancelled.current = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  const showCursorOnLine = (i) => {
    const isLastLine = i === lines.length - 1;
    const lineNotDone = !lines[i]?.done;
    const isFinalPrompt = LINES[i]?.final;
    return isLastLine && (lineNotDone || isFinalPrompt);
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
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE.red, flexShrink: 0 }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE.yellow, flexShrink: 0 }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE.green, flexShrink: 0 }} />
        <span style={{ marginLeft: 8, fontSize: 10, color: PALETTE.gray }}>deploy — bash</span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', minHeight: '200px' }}>
        {lines.map((line, i) => {
          const spec = LINES[i];
          if (!spec) return null;
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
