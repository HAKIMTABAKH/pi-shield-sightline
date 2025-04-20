
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  BarChart, 
  Bell, 
  History, 
  Settings, 
  Info, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItem = ({ icon, label, href, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isCollapsed ? "justify-center" : "",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { icon: <BarChart size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Bell size={20} />, label: 'Alerts', href: '/alerts' },
    { icon: <History size={20} />, label: 'History', href: '/history' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
    { icon: <Info size={20} />, label: 'About', href: '/about' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[220px]"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl">PiShield</span>
          </div>
        )}
        {isCollapsed && <ShieldCheck className="h-6 w-6 text-primary mx-auto" />}
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "ml-auto",
            isCollapsed ? "mx-auto" : "ml-auto"
          )}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={
              item.href === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.href)
            }
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
      
      <div className="border-t p-4">
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "justify-center" : ""
        )}>
          <span className="status-indicator status-success"></span>
          {!isCollapsed && <span className="text-xs">System Active</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
