"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Search, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersApi, tasksApi, ApiErrorClass } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { User } from "@/types";

interface UserSelectDropdownProps {
  taskId?: string;
  selectedUserId: string | null;
  onUserChange?: (userId: string | null) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
  showAvatar?: boolean;
  placeholder?: string;
}

export function UserSelectDropdown({
  taskId,
  selectedUserId,
  onUserChange,
  disabled = false,
  size = "default",
  variant = "default",
  showAvatar = true,
  placeholder = "Assign",
}: UserSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const response = await usersApi.list();
        setUsers(response);
      } catch (err) {
        if (err instanceof ApiErrorClass) {
          setError(err.message);
        } else {
          setError("Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev => {
            const filteredUsers = getFilteredUsers();
            const nextIndex = prev < filteredUsers.length - 1 ? prev + 1 : prev;
            scrollToItem(nextIndex);
            return nextIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : 0;
            scrollToItem(nextIndex);
            return nextIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            const filteredUsers = getFilteredUsers();
            if (highlightedIndex === 0 && searchQuery === "") {
              // First option is "Unassign"
              handleUserSelect(null);
            } else if (filteredUsers[highlightedIndex]) {
              handleUserSelect(filteredUsers[highlightedIndex].id);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, searchQuery]);

  const scrollToItem = useCallback((index: number) => {
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll("li");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  }, []);

  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    return users.filter(
      user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getSelectedUser = () => {
    return users.find(u => u.id === selectedUserId);
  };

  const handleUserSelect = async (userId: string | null) => {
    if (updating) return;

    // If taskId is provided, update via API
    if (taskId) {
      setUpdating(true);
      setError(null);
      setSuccess(false);

      try {
        await tasksApi.update(taskId, { assigneeId: userId || undefined });

        // Show success feedback
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);

        // Call onUserChange callback
        onUserChange?.(userId);
      } catch (err) {
        if (err instanceof ApiErrorClass) {
          setError(err.message);
        } else {
          setError("Failed to update assignee");
        }
        setTimeout(() => setError(null), 3000);
      } finally {
        setUpdating(false);
      }
    } else {
      // Just call the callback
      onUserChange?.(userId);
    }

    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  const selectedUser = getSelectedUser();

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    default: "h-8 px-2.5 text-sm",
    lg: "h-9 px-3 text-base",
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        type="button"
        variant={variant}
        size={size}
        onClick={() => !disabled && !updating && setIsOpen(!isOpen)}
        disabled={disabled || updating}
        className={cn(
          "gap-2 font-medium",
          success && "border-success text-success",
          sizeClasses[size]
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="user-select-label"
      >
        {updating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : selectedUser ? (
          <>
            {showAvatar && (
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate max-w-[150px]">{selectedUser.name}</span>
          </>
        ) : (
          <>
            <UserIcon className="h-4 w-4" />
            <span>{placeholder}</span>
          </>
        )}
      </Button>

      {/* Error/Success Messages */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
          {error}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 top-full left-0 mt-1 w-72 bg-background border border-input rounded-lg shadow-lg"
          role="listbox"
          aria-labelledby="user-select-label"
          aria-activedescendant={
            highlightedIndex >= 0 ? `user-option-${highlightedIndex}` : undefined
          }
        >
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                className="w-full pl-9"
                placeholder="Search users..."
                aria-label="Search users"
              />
            </div>
          </div>

          {/* User List */}
          <ul ref={listRef} className="max-h-64 overflow-y-auto py-1" role="listbox">
            {loading ? (
              <li className="px-3 py-8 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </li>
            ) : filteredUsers.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                {searchQuery ? "No users found" : "No users available"}
              </li>
            ) : (
              <>
                {/* Unassign Option */}
                {selectedUserId && (
                  <li>
                    <button
                      type="button"
                      onClick={() => handleUserSelect(null)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-muted transition-colors",
                        highlightedIndex === 0 && "bg-muted"
                      )}
                      role="option"
                      aria-selected={!selectedUserId}
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">Unassigned</span>
                    </button>
                  </li>
                )}

                {/* User Options */}
                {filteredUsers.map((user, index) => {
                  const isSelected = user.id === selectedUserId;
                  const adjustedIndex = selectedUserId ? index + 1 : index;

                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        id={`user-option-${adjustedIndex}`}
                        onClick={() => handleUserSelect(user.id)}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-muted transition-colors",
                          isSelected && "bg-muted",
                          highlightedIndex === adjustedIndex && "bg-muted"
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {/* Avatar */}
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </>
            )}
          </ul>

          {/* Footer with user count */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-3 py-2 border-t text-xs text-muted-foreground">
              {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
