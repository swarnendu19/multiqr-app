"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  QrCode,
  User,
  Settings,
  LogOut,
  Plus,
  CreditCard,
  Menu,
  LayoutDashboard,
  FileStack,
  BarChart3
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, signOut, isProUser } = useAuth();
  const router = useRouter();
  const t = useTranslations('Header');
  const tSidebar = useTranslations('Sidebar');

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full bg-sidebar">
                <div className="p-6">
                  <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-accent shadow-soft">
                      <QrCode className="h-5 w-5 text-sidebar-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-sidebar-foreground">MultiQR</span>
                  </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                  {[
                    { icon: LayoutDashboard, label: tSidebar('dashboard'), path: '/manage' },
                    { icon: QrCode, label: tSidebar('myQrCodes'), path: '/manage' },
                    { icon: FileStack, label: tSidebar('templates'), path: '/manage/templates' },
                    { icon: BarChart3, label: tSidebar('analytics'), path: '/manage/analytics' },
                    { icon: User, label: tSidebar('account'), path: '/account' },
                    { icon: Settings, label: tSidebar('settings'), path: '/account/settings' },
                  ].map((item) => (
                    <NavLink
                      key={item.label + item.path} // unique key
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
                  {isProUser ? (
                    <>
                      <h4 className="font-semibold text-sidebar-foreground mb-1">{tSidebar('proActive')}</h4>
                      <p className="text-xs text-sidebar-foreground/70">
                        {tSidebar('access')}
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-sidebar-foreground mb-1">{tSidebar('upgrade')}</h4>
                      <p className="text-xs text-sidebar-foreground/70 mb-3">
                        {tSidebar('unlock')}
                      </p>
                      <NavLink
                        href="/pricing"
                        className="block w-full py-2 px-4 text-center text-sm font-medium rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        {tSidebar('viewPlans')}
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-soft group-hover:shadow-glow transition-all">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">MultiQR</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" onClick={() => router.push('/pricing')} className="hidden sm:flex">
            {t('pricing')}
          </Button>
          {user ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/qrcodes/new')}
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('createQr')}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-secondary">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isProUser ? t('proPlan') : t('freePlan')}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/manage')}>
                    <QrCode className="mr-2 h-4 w-4" />
                    {tSidebar('myQrCodes')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    {tSidebar('account')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {tSidebar('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/pricing')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('pricing')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('signOut')}
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/login')}>
                {t('signIn')}
              </Button>
              <Button variant="secondary" onClick={() => router.push('/register')}>
                {t('getStarted')}
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
