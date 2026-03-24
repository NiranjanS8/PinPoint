import { Archive } from "lucide-react";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";

export function ArchivedPage() {
  return (
    <div>
      <PageHeader title="Archived" subtitle="Videos and playlists you've archived" />
      <div className="mt-[34px]">
        <EmptyStateCard
          icon={<Archive className="size-[54px]" strokeWidth={1.8} />}
          title="No archived content yet"
          description="Archived videos and playlists will appear here."
        />
      </div>
    </div>
  );
}
