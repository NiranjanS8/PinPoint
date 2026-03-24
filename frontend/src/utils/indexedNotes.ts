export interface IndexedNoteItem {
  id: string;
  text: string;
  timestampSeconds: number | null;
  createdAt: string;
}

interface IndexedNotesPayload {
  kind: "pinpoint-indexed-notes";
  items: IndexedNoteItem[];
}

export function parseIndexedNotes(rawNotes: string): IndexedNoteItem[] {
  if (!rawNotes.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawNotes) as IndexedNotesPayload;
    if (parsed.kind === "pinpoint-indexed-notes" && Array.isArray(parsed.items)) {
      return parsed.items.filter(
        (item): item is IndexedNoteItem =>
          typeof item?.id === "string" &&
          typeof item?.text === "string" &&
          typeof item?.createdAt === "string" &&
          (typeof item?.timestampSeconds === "number" || item?.timestampSeconds === null)
      );
    }
  } catch {
    // Fall back to legacy plain text notes below.
  }

  return [
    {
      id: "legacy-note",
      text: rawNotes,
      timestampSeconds: null,
      createdAt: new Date(0).toISOString()
    }
  ];
}

export function stringifyIndexedNotes(notes: IndexedNoteItem[]) {
  return JSON.stringify({
    kind: "pinpoint-indexed-notes",
    items: notes
  } satisfies IndexedNotesPayload);
}

export function getIndexedNotesPreview(rawNotes: string) {
  const notes = parseIndexedNotes(rawNotes);
  return notes[0]?.text?.trim() ?? "";
}

export function formatNoteTimestamp(totalSeconds: number | null) {
  if (totalSeconds === null || Number.isNaN(totalSeconds)) {
    return "No timestamp";
  }

  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
