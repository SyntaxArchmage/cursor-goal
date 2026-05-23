export function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-dot code-dot-red" />
        <span className="code-dot code-dot-yellow" />
        <span className="code-dot code-dot-green" />
        <span className="ml-2 text-xs text-[var(--color-muted)]">{title}</span>
      </div>
      <pre className="p-4 text-sm leading-relaxed overflow-x-auto font-[var(--font-mono)] text-gray-300">
        {children}
      </pre>
    </div>
  )
}
