import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  QrCode,
  FileStack,
  BarChart3,
  CreditCard,
  Settings,
  User,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/manage' },
  { icon: QrCode, label: 'My QR Codes', path: '/manage' },
  { icon: FileStack, label: 'Templates', path: '/manage/templates' },
  { icon: BarChart3, label: 'Analytics', path: '/manage/analytics' },
  { icon: User, label: 'Account', path: '/account' },
  { icon: Settings, label: 'Settings', path: '/account/settings' },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <NavLink href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-accent shadow-soft">
            <QrCode className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">MultiQR</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            href={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors'
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-accent/20 border border-sidebar-border">
        <h4 className="font-semibold text-sidebar-foreground mb-1">Upgrade to Pro</h4>
        <p className="text-xs text-sidebar-foreground/70 mb-3">
          Unlock unlimited exports and premium features
        </p>
        <NavLink
          href="/pricing"
          className="block w-full py-2 px-4 text-center text-sm font-medium rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
        >
          View Plans
        </NavLink>
      </div>
    </aside>
  );
}
