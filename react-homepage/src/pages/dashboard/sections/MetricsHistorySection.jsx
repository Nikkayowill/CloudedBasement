import { useState, useEffect } from 'react';

// ── Metrics Line Chart ────────────────────────────────────────────────────────

function SimpleLineChart({ data, label, color, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0.625rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#525252',
        fontSize: '0.875rem',
      }}>
        No data available
      </div>
    );
  }

  // Find min/max to scale the chart
  const values = data.filter(d => d !== null);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 100);
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const width = 500;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;

  // Scale data to SVG coordinates
  const span = Math.max(1, data.length - 1);
  const points = data.map((val, i) => {
    if (val === null) return null;
    const x = padding.left + (i / span) * chartWidth;
    const y = padding.top + chartHeight - ((val - minVal) / range) * (chartHeight - padding.top - padding.bottom);
    return { x, y };
  }).filter(p => p !== null);

  // Create path
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0.625rem',
      padding: '0.875rem',
      overflow: 'auto',
    }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`} style={{ minWidth: '300px' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((y) => {
          const yPos = padding.top + (1 - y) * (chartHeight - padding.top - padding.bottom);
          const val = Math.round(minVal + y * range);
          return (
            <g key={`grid-${y}`}>
              <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={padding.left - 8} y={yPos + 4} fontSize="11" fill="#525252" textAnchor="end">
                {val}%
              </text>
            </g>
          );
        })}

        {/* Data line */}
        {pathData && (
          <>
            <path d={pathData} stroke={color} strokeWidth="2" fill="none" />
            {/* Area fill */}
            <defs>
              <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight - padding.bottom} L ${points[0].x} ${padding.top + chartHeight - padding.bottom} Z`}
              fill={`url(#grad-${label})`}
            />
          </>
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}

        {/* X-axis */}
        <line x1={padding.left} y1={padding.top + chartHeight - padding.bottom} x2={width - padding.right} y2={padding.top + chartHeight - padding.bottom} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>

      <div style={{ fontSize: '0.75rem', color: '#525252', marginTop: '0.5rem', textAlign: 'center' }}>
        {label} — {data.length} data points
      </div>
    </div>
  );
}

// ── Metrics History Section ──────────────────────────────────────────────────

export function MetricsHistorySection() {
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({ data: [] });

  useEffect(() => {
    fetchMetricsHistory();
  }, [period]);

  const fetchMetricsHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/metrics/history?period=${period}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setMetrics(result);
    } catch (err) {
      setError(`Failed to load metrics: ${err.message}`);
      setMetrics({ data: [] });
    } finally {
      setLoading(false);
    }
  };

  const cpuData = metrics.data?.map(d => d.cpu) || [];
  const memoryData = metrics.data?.map(d => d.memory) || [];
  const diskData = metrics.data?.map(d => d.disk) || [];

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Metrics History
        </h2>
        <p style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>
          View CPU, memory, and disk usage trends over time
        </p>
      </div>

      {/* Period selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        {['24h', '7d', '30d'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '0.5rem 1rem',
              background: period === p ? '#3b82f6' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${period === p ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
              color: '#ffffff',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (period !== p) e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              if (period !== p) e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '0.875rem 1rem',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.375rem',
          color: '#fca5a5',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#525252',
        }}>
          Loading metrics...
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <SimpleLineChart data={cpuData} label="CPU Usage" color="#3b82f6" />
          <SimpleLineChart data={memoryData} label="Memory Usage" color="#8b5cf6" />
          <SimpleLineChart data={diskData} label="Disk Usage" color="#ec4899" />
        </div>
      )}

      {!loading && !error && metrics.data?.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.875rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          color: '#525252',
        }}>
          Showing {metrics.dataPoints ?? metrics.data?.length ?? 0} data points for the last {period}
        </div>
      )}
    </div>
  );
}

export default MetricsHistorySection;
