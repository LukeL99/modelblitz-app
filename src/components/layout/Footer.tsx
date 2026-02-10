import { BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <BarChart3 className="w-5 h-5 text-ember" />
            <span className="font-semibold text-text-primary">ModelPick</span>
            <span className="text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Twitter</a>
            <a href="#" className="hover:text-text-secondary transition-colors">GitHub</a>
          </div>
        </div>
        <p className="text-center mt-6 text-text-muted text-sm">Built by indie devs, for indie devs</p>
      </div>
    </footer>
  );
}
