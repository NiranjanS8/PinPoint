import { type FormEvent, useState } from "react";
import { Button } from "./Button";
import { detectContentType, isValidYouTubeUrl } from "../utils/youtube";

interface AddContentFormProps {
  isSubmitting: boolean;
  onSubmit: (url: string) => Promise<void>;
}

export function AddContentForm({ isSubmitting, onSubmit }: AddContentFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Paste a YouTube video or playlist URL.");
      return;
    }

    if (!isValidYouTubeUrl(trimmedUrl) || !detectContentType(trimmedUrl)) {
      setError("Please enter a valid YouTube video or playlist link.");
      return;
    }

    setError("");

    try {
      await onSubmit(trimmedUrl);
      setUrl("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not save content.");
    }
  }

  return (
    <section className="surface add-form-panel">
      <div className="section-heading">
        <div className="section-copy">
          <h2>Add content</h2>
          <p>Paste a YouTube video or playlist link to save it locally.</p>
        </div>
      </div>

      <form className="add-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="content-url">
          YouTube URL
        </label>
        <input
          id="content-url"
          className="text-input"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add"}
        </Button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
