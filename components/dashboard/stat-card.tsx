interface StatCardProps {
  label: string;
  value: number | string;
  emoji: string;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  emoji,
  accentColor = "var(--color-primary)",
}: StatCardProps) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        minHeight: "88px",
      }}
    >
      {/* Icon box — fixed size, no emoji, use text symbol */}
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        {emoji}
      </div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.775rem",
            color: "var(--color-text-muted)",
            marginTop: "0.25rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
