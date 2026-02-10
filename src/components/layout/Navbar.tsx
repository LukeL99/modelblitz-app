import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-primary font-bold text-lg">
          <BarChart3 className="w-6 h-6 text-ember" />
          <span>ModelPick</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#how-it-works" className="text-text-secondary hover:text-text-primary text-sm transition-colors">How it Works</a>
          <a href="/#pricing" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Pricing</a>
          <a href="/#faq" className="text-text-secondary hover:text-text-primary text-sm transition-colors">FAQ</a>
          <Link
            to="/benchmark"
            className="bg-ember hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Run a Benchmark →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-b border-surface-border px-4 pb-4 space-y-3">
          <a href="/#how-it-works" className="block text-text-secondary text-sm py-2" onClick={() => setMobileOpen(false)}>How it Works</a>
          <a href="/#pricing" className="block text-text-secondary text-sm py-2" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="/#faq" className="block text-text-secondary text-sm py-2" onClick={() => setMobileOpen(false)}>FAQ</a>
          <Link
            to="/benchmark"
            className="block bg-ember text-white font-semibold text-sm px-5 py-2.5 rounded-lg text-center"
            onClick={() => setMobileOpen(false)}
          >
            Run a Benchmark →
          </Link>
        </div>
      )}
    </nav>
  );
}
