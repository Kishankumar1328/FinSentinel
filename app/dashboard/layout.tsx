'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Target,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/expenses', label: 'Expenses', icon: TrendingUp },
  { href: '/dashboard/income', label: 'Income', icon: Wallet },
  { href: '/dashboard/budgets', label: 'Budgets', icon: Wallet },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Demo mode - get user from localStorage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/auth/signin');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">FinSentinel</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden md:flex flex-col`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              FS
            </div>
            {sidebarOpen && <span>FinSentinel</span>}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size={sidebarOpen ? 'default' : 'icon'}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className={`text-sm ${sidebarOpen ? '' : 'text-center'}`}>
            {sidebarOpen && (
              <>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
            size={sidebarOpen ? 'default' : 'icon'}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-sidebar border-b border-sidebar-border p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              FS
            </div>
            <span>FinSentinel</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
