import Nav from './Nav'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-grid">
      <Nav />
      <main className="pt-24 pb-16 px-6">{children}</main>
      <footer className="py-8 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-[var(--color-muted)]">
          <div>🎯 cursor-goal — MIT License</div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a
              href="https://github.com/SyntaxArchmage/cursor-goal"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span>First open-source /goal for Cursor</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
