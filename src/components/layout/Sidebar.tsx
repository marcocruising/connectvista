import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <nav className="space-y-1 p-2">
        <Link 
          to="/settings" 
          className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar; 