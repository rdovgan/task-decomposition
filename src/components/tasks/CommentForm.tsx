"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  submitting?: boolean;
  placeholder?: string;
}

export function CommentForm({
  onSubmit,
  submitting = false,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`rounded-lg border transition-colors ${
          focused ? "border-ring ring-2 ring-ring/20" : "border-input"
        }`}
      >
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={3}
          disabled={submitting}
          className="w-full rounded-lg bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {focused && (
          <div className="flex items-center justify-between border-t px-3 py-2 bg-muted/30">
            <span className="text-xs text-muted-foreground">
              Markdown supported
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setContent("");
                  setFocused(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !content.trim()}
              >
                {submitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
