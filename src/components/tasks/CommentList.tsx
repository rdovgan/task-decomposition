'use client';

import { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

export function CommentList({ comments, onEdit, onDelete, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="font-semibold">{comment.author?.name || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString()}
                {comment.updatedAt !== comment.createdAt && ' (edited)'}
              </div>
            </div>
            {currentUserId && comment.authorId === currentUserId && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => {
                      const newContent = prompt('Edit comment:', comment.content);
                      if (newContent) onEdit(comment.id, newContent);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this comment?')) {
                        onDelete(comment.id);
                      }
                    }}
                    className="text-xs text-destructive hover:text-destructive/80"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
        </div>
      ))}
    </div>
  );
}
