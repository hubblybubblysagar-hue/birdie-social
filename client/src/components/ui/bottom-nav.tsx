import { useLocation, Link } from 'wouter';
import { Home, Heart, Calendar, Newspaper, User } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export function BottomNav() {
  const [location] = useLocation();
  
  const navItems: NavItem[] = [
    { 
      label: 'Home', 
      path: '/', 
      icon: <Home className="text-xl" /> 
    },
    { 
      label: 'Matches', 
      path: '/matches', 
      icon: <Heart className="text-xl" /> 
    },
    { 
      label: 'Tee Times', 
      path: '/tee-times', 
      icon: <Calendar className="text-xl" /> 
    },
    { 
      label: 'Feed', 
      path: '/feed', 
      icon: <Newspaper className="text-xl" /> 
    },
    { 
      label: 'Profile', 
      path: '/profile', 
      icon: <User className="text-xl" /> 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
          >
            <a className={`flex flex-col items-center py-3 px-4 ${
              location === item.path ? 'text-primary' : 'text-gray-500'
            }`}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
