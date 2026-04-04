"use client";

import { useState } from "react";
import { TaskLink, LinkType } from "@/types";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

interface TaskLinkListProps {
  links: TaskLink[];
  onDelete?: (linkId: string) => Promise<void>;
  onCreate?: (data: { url: string; linkType: LinkType; title?: string }) => Promise<void>;
}

export function TaskLinkList({ links, onDelete, onCreate }: TaskLinkListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ url: "", linkType: "EXTERNAL" as LinkType, title: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.url.trim()) return;

    setSubmitting(true);
    try {
      await onCreate?.(newLink);
      setNewLink({ url: "", linkType: "EXTERNAL", title: "" });
      setShowAddForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const linkTypeLabels: Record<LinkType, string> = {
    CONFLUENCE: "Confluence",
    NOTION: "Notion",
    GITHUB: "GitHub",
    JIRA: "Jira",
    FIGMA: "Figma",
    EXTERNAL: "External",
  };

  if (links.length === 0 && !showAddForm) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No external links.</p>
        {onCreate && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {links.map(link => (
          <div
            key={link.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {link.title || link.url}
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    {linkTypeLabels[link.linkType]}
                  </span>
                  <span>{link.url}</span>
                </div>
              </div>
            </div>
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(link.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {showAddForm && onCreate && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 space-y-3">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              URL <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              id="url"
              required
              value={newLink.url}
              onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newLink.title}
              onChange={e => setNewLink({ ...newLink, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Link title (optional)"
            />
          </div>

          <div>
            <label htmlFor="linkType" className="block text-sm font-medium mb-1">
              Type
            </label>
            <select
              id="linkType"
              value={newLink.linkType}
              onChange={e => setNewLink({ ...newLink, linkType: e.target.value as LinkType })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(linkTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewLink({ url: "", linkType: "EXTERNAL", title: "" });
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!showAddForm && onCreate && (
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      )}
    </div>
  );
}
