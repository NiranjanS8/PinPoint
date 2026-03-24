import { Archive, BarChart3, Clock3, FolderOpen, Home, Library, Moon, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { SidebarNavItem } from "../ui/SidebarNavItem";

const primaryLinks = [
  { to: "/", label: "Dashboard", icon: <Home className="size-[18px]" /> },
  { to: "/library", label: "Library", icon: <Library className="size-[18px]" /> },
  { to: "/playlists", label: "Playlists", icon: <FolderOpen className="size-[18px]" /> },
  { to: "/archived", label: "Archived", icon: <Archive className="size-[18px]" /> }
];

const secondaryLinks = [
  { to: "/analytics", label: "Analytics", icon: <BarChart3 className="size-[18px]" /> },
  { to: "/study-session", label: "Study Session", icon: <Clock3 className="size-[18px]" /> }
];

export function AppSidebar({
  onOpenAddVideo,
  onToggleDarkMode,
  isDarkMode
}: {
  onOpenAddVideo: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}) {
  const location = useLocation();

  return (
    <aside className="flex h-screen w-[296px] shrink-0 flex-col border-r border-borderSoft bg-sidebar">
      <div className="border-b border-borderSoft px-[30px] pb-7 pt-[34px]">
        <h1 className="m-0 text-[27px] font-bold leading-[1.15] tracking-[-0.03em] text-textStrong">
          Pinpoint
        </h1>
        <p className="mt-2 text-sm text-textMuted">Learning Workspace</p>
      </div>

      <nav className="px-3.5 pt-[18px]">
        <div className="grid gap-1">
          {primaryLinks.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="block w-full">
              {({ isActive }) => <SidebarNavItem active={isActive} icon={item.icon} label={item.label} />}
            </NavLink>
          ))}
        </div>

        <div className="mx-1.5 my-[22px] h-px bg-borderSoft" />

        <div className="grid gap-1">
          {secondaryLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className="block w-full">
              {({ isActive }) => (
                <SidebarNavItem
                  active={isActive || location.pathname === item.to}
                  icon={item.icon}
                  label={item.label}
                />
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto grid gap-2.5 border-t border-borderSoft p-[18px]">
        <SecondaryButton className="justify-center" onClick={onToggleDarkMode}>
          <Moon className="size-4" />
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </SecondaryButton>
        <PrimaryButton className="justify-start" onClick={onOpenAddVideo}>
          <Plus className="size-4" />
          <span>Add Video</span>
          <span className="ml-auto text-sm text-white/60">Ctrl+K</span>
        </PrimaryButton>
      </div>
    </aside>
  );
}
