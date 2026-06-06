import { NavLink } from 'react-router-dom';
import { FileText, BarChart3 } from 'lucide-react';

const links = [
  { to: '/invoices', label: 'Invoices', icon: FileText, end: false },
  { to: '/summary', label: 'Summary', icon: BarChart3, end: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-semibold text-ink">Invoice Dashboard</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-canvas text-ink font-medium'
                  : 'text-inkSecondary hover:bg-canvas hover:text-ink',
              ].join(' ')
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border px-4 py-3 text-xs text-muted">
        v1.0.0 · PowerPlay
      </div>
    </aside>
  );
}
