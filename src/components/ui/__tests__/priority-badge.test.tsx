import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "../priority-badge";

describe("PriorityBadge", () => {
  it("renders critical priority with correct styling", () => {
    render(<PriorityBadge priority="CRITICAL" />);
    const badge = screen.getByText(/critical/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-danger/10");
  });

  it("renders high priority with correct styling", () => {
    render(<PriorityBadge priority="HIGH" />);
    const badge = screen.getByText(/high/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-warning/15");
  });

  it("renders medium priority with correct styling", () => {
    render(<PriorityBadge priority="MEDIUM" />);
    const badge = screen.getByText(/medium/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-info/10");
  });

  it("renders low priority with correct styling", () => {
    render(<PriorityBadge priority="LOW" />);
    const badge = screen.getByText(/low/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-muted");
  });

  it("renders icon for each priority", () => {
    const { rerender } = render(<PriorityBadge priority="CRITICAL" />);
    expect(screen.getByText("⚡")).toBeInTheDocument();

    rerender(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText("↑")).toBeInTheDocument();

    rerender(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText("→")).toBeInTheDocument();

    rerender(<PriorityBadge priority="LOW" />);
    expect(screen.getByText("↓")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<PriorityBadge priority="HIGH" className="custom-class" />);
    const badge = screen.getByText(/high/i);
    expect(badge).toHaveClass("custom-class");
  });
});
