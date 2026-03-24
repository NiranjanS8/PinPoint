import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

interface FolderActionsMenuProps {
  onCreateSubfolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FolderActionsMenu({
  onCreateSubfolder,
  onRename,
  onDelete
}: FolderActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function runAction(callback: () => void) {
    callback();
    setOpen(false);
  }

  return (
    <div className="folder-menu" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className="folder-menu-trigger"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        •••
      </Button>

      {open ? (
        <div className="folder-menu-popover">
          <button type="button" className="folder-menu-item" onClick={() => runAction(onCreateSubfolder)}>
            Add subfolder
          </button>
          <button type="button" className="folder-menu-item" onClick={() => runAction(onRename)}>
            Rename
          </button>
          <button type="button" className="folder-menu-item danger" onClick={() => runAction(onDelete)}>
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
