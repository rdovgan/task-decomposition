import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../status-badge";

describe("StatusBadge", () => {
  describe("Project Statuses", () => {
    it("renders active status", () => {
      render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText("Active")).toHaveClass("bg-success/10");
    });

    it("renders archived status", () => {
      render(<StatusBadge status="ARCHIVED" />);
      expect(screen.getByText("Archived")).toHaveClass("bg-muted");
    });

    it("renders on hold status", () => {
      render(<StatusBadge status="ON_HOLD" />);
      expect(screen.getByText("On Hold")).toHaveClass("bg-warning/15");
    });
  });

  describe("Epic Statuses", () => {
    it("renders backlog status", () => {
      render(<StatusBadge status="BACKLOG" />);
      expect(screen.getByText("Backlog")).toHaveClass("bg-muted");
    });

    it("renders in progress status", () => {
      render(<StatusBadge status="IN_PROGRESS" />);
      expect(screen.getByText("In Progress")).toHaveClass("bg-info/10");
    });

    it("renders in review status", () => {
      render(<StatusBadge status="IN_REVIEW" />);
      expect(screen.getByText("In Review")).toHaveClass("bg-purple/10");
    });

    it("renders done status", () => {
      render(<StatusBadge status="DONE" />);
      expect(screen.getByText("Done")).toHaveClass("bg-success/10");
    });

    it("renders cancelled status", () => {
      render(<StatusBadge status="CANCELLED" />);
      expect(screen.getByText("Cancelled")).toHaveClass("bg-danger/10");
    });
  });

  describe("Task Statuses", () => {
    it("renders todo status", () => {
      render(<StatusBadge status="TODO" />);
      expect(screen.getByText("To Do")).toHaveClass("bg-muted");
    });

    it("renders blocked status", () => {
      render(<StatusBadge status="BLOCKED" />);
      expect(screen.getByText("Blocked")).toHaveClass("bg-danger/10");
    });
  });

  it("handles unknown status", () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN")).toHaveClass("bg-muted");
  });

  it("applies custom className", () => {
    render(<StatusBadge status="ACTIVE" className="custom-class" />);
    expect(screen.getByText("Active")).toHaveClass("custom-class");
  });
});
