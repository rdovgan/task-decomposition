"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  // Selection props
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  getRowId?: (row: T, index: number) => string | number;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  emptyMessage = "No data available",
  className,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (_, index) => index,
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    if (sortKey === column.key) {
      onSort(sortDirection === "asc" ? `${column.key}:desc` : column.key);
    } else {
      onSort(column.key);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = new Set(data.map((row, index) => getRowId(row, index)));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    onSelectionChange(newSelection);
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  const getSortIcon = (column: Column<T>) => {
    if (sortKey !== column.key) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            {selectable && (
              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[44px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring cursor-pointer accent-primary"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                className={cn(
                  "h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  column.sortable && "cursor-pointer hover:text-foreground transition-colors",
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-0.5">
                  {column.title}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowId = getRowId(row, rowIndex);
            const isSelected = selectedRows.has(rowId);

            return (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b transition-colors",
                  onRowClick && "cursor-pointer",
                  isSelected
                    ? "bg-primary/5"
                    : "hover:bg-muted/40",
                )}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                    return;
                  }
                  onRowClick?.(row);
                }}
              >
                {selectable && (
                  <td className="p-4 align-middle w-[44px]">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => {
                        e.stopPropagation();
                        handleSelectRow(rowId, e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring cursor-pointer accent-primary"
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 align-middle", column.className)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
