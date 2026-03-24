import { useEffect, useMemo, useState } from "react";
import { AddContentForm } from "../components/AddContentForm";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ContentGrid } from "../components/ContentGrid";
import { EmptyState } from "../components/EmptyState";
import { FilterBar } from "../components/FilterBar";
import { Header } from "../components/Header";
import { PlayerView } from "../components/PlayerView";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { contentApi } from "../services/api";
import type { FilterType, SavedContent } from "../types/content";

export function HomePage() {
  const [items, setItems] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("ALL");
  const [activeContent, setActiveContent] = useState<SavedContent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedContent | null>(null);
  const [pageError, setPageError] = useState("");
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setPageError("");

    try {
      const response = await contentApi.getAll();
      setItems(response);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(url: string) {
    setSaving(true);

    try {
      const createdItem = await contentApi.add(url);
      setItems((current) => sortItems([createdItem, ...current]));
      showToast("Saved to Pinpoint.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save content.";
      if (message === "Already added.") {
        showToast(message, "info");
      }
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin(content: SavedContent) {
    const previousItems = items;
    const optimisticItems = sortItems(
      items.map((item) => (item.id === content.id ? { ...item, pinned: !item.pinned } : item))
    );
    setItems(optimisticItems);

    try {
      const updatedItem = await contentApi.togglePin(content.id);
      setItems((current) =>
        sortItems(current.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
      );
    } catch (error) {
      setItems(previousItems);
      showToast(error instanceof Error ? error.message : "Could not update pin state.", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);

    try {
      await contentApi.remove(deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      showToast("Item deleted.", "success");
      setDeleteTarget(null);

      if (activeContent?.id === deleteTarget.id) {
        setActiveContent(null);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete content.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredItems = useMemo(() => {
    if (selectedFilter === "ALL") {
      return items;
    }

    if (selectedFilter === "PINNED") {
      return items.filter((item) => item.pinned);
    }

    return items.filter((item) => item.contentType === selectedFilter);
  }, [items, selectedFilter]);

  return (
    <main className="app-shell">
      <div className="app-gradient" />
      <div className="app-content">
        <Header />
        <AddContentForm isSubmitting={saving} onSubmit={handleAdd} />
        <FilterBar activeFilter={selectedFilter} onChange={setSelectedFilter} />

        {loading ? <section className="surface status-panel">Loading your content...</section> : null}
        {!loading && pageError ? <section className="surface status-panel error-panel">{pageError}</section> : null}
        {!loading && !pageError && filteredItems.length === 0 ? <EmptyState /> : null}

        {!loading && !pageError && filteredItems.length > 0 ? (
          <ContentGrid
            items={filteredItems}
            onOpen={setActiveContent}
            onTogglePin={handleTogglePin}
            onDelete={setDeleteTarget}
          />
        ) : null}

        {activeContent ? <PlayerView content={activeContent} onClose={() => setActiveContent(null)} /> : null}
        {deleteTarget ? (
          <ConfirmDeleteDialog
            content={deleteTarget}
            isDeleting={deletingId === deleteTarget.id}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        ) : null}

        <Toast toast={toast} onClose={clearToast} />
      </div>
    </main>
  );
}

function sortItems(items: SavedContent[]) {
  return [...items].sort((first, second) => {
    if (first.pinned !== second.pinned) {
      return first.pinned ? -1 : 1;
    }

    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });
}
