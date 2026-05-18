"use client";

import { Comment } from "@/types";
import { cn } from "@/lib/utils";

interface CommentListProps {
  comments: Comment[];
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

export function CommentList({ comments, onEdit, onDelete, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  // Helper to generate a consistent color from a name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-amber-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Relative time formatter
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {comments.map(comment => {
        const authorName = comment.author?.name || "Unknown";
        const isEdited = comment.updatedAt !== comment.createdAt;

        return (
          <div key={comment.id} className="group flex gap-3">
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                getAvatarColor(authorName)
              )}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-foreground">{authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {getRelativeTime(comment.createdAt)}
                </span>
                {isEdited && (
                  <span className="text-xs text-muted-foreground/60">(edited)</span>
                )}
              </div>
              <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </div>

              {/* Actions - shown on hover */}
              {currentUserId && comment.authorId === currentUserId && (onEdit || onDelete) && (
                <div className="mt-1 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => {
                        const newContent = prompt("Edit comment:", comment.content);
                        if (newContent) onEdit(comment.id, newContent);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this comment?")) {
                          onDelete(comment.id);
                        }
                      }}
                      className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
