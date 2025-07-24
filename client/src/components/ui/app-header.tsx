import { Bell } from 'lucide-react';
import { Link } from 'wouter';

interface AppHeaderProps {
  title?: string;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
}

export function AppHeader({ 
  title = "Birdie Social", 
  showNotifications = true,
  onNotificationsClick
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-30 bg-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <a className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 mr-2 text-primary" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-montserrat font-bold text-primary">{title}</h1>
          </a>
        </Link>
        
        {showNotifications && (
          <div className="flex items-center">
            <button 
              className="ml-4 text-primary"
              onClick={onNotificationsClick}
            >
              <Bell className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
