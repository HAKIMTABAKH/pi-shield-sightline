
import { useState } from 'react';
import { LogOut, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  // Mock user state - would be from auth context in real app
  const [user] = useState({ email: 'admin@pishield.local' });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, this would call auth logout function
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system.",
    });
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <header className="border-b bg-background px-6 py-3">
      <div className="flex h-10 items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">
              {user.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex w-full cursor-pointer items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

