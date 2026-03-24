import { Outlet, Link, useLocation } from "react-router";
import { Home, Library, Archive, Plus, FolderOpen, BarChart3, Clock, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { AddVideoDialog } from "./AddVideoDialog";

export function Layout() {
  const location = useLocation();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for add video
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAddDialogOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Pinpoint</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Learning Workspace</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                isActive("/") && location.pathname === "/"
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Home className="size-4" />
              Dashboard
            </Button>
          </Link>

          <Link to="/library">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                isActive("/library")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Library className="size-4" />
              Library
            </Button>
          </Link>

          <Link to="/playlists">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                isActive("/playlists")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <FolderOpen className="size-4" />
              Playlists
            </Button>
          </Link>

          <Link to="/archived">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                isActive("/archived")
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Archive className="size-4" />
              Archived
            </Button>
          </Link>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
            <Link to="/analytics">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive("/analytics")
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <BarChart3 className="size-4" />
                Analytics
              </Button>
            </Link>

            <Link to="/study">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive("/study")
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Clock className="size-4" />
                Study Session
              </Button>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="w-full gap-2"
          >
            {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {darkMode ? 'Light' : 'Dark'} Mode
          </Button>
          
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="w-full gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
          >
            <Plus className="size-4" />
            Add Video
            <kbd className="ml-auto text-xs opacity-60">⌘K</kbd>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <AddVideoDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}