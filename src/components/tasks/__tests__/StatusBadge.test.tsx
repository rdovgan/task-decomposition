import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskStatusBadge } from "../StatusBadge";
import { tasksApi } from "@/lib/api-client";
import { TaskStatus } from "@/types";

// Mock the API client
jest.mock("@/lib/api-client");
const mockTasksApi = tasksApi as jest.Mocked<typeof tasksApi>;

describe("TaskStatusBadge", () => {
  const defaultProps = {
    taskId: "task-123",
    status: "TODO" as TaskStatus,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Display Mode", () => {
    it("renders TODO status with correct styling", () => {
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);
      const badge = screen.getByText("To Do").closest("button");
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(badge).toHaveClass("bg-muted");
    });

    it("renders IN_PROGRESS status with correct styling", () => {
      render(<TaskStatusBadge {...defaultProps} status="IN_PROGRESS" />);
      const badge = screen.getByText("In Progress").closest("button");
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(badge).toHaveClass("bg-info/10");
    });

    it("renders IN_REVIEW status with correct styling", () => {
      render(<TaskStatusBadge {...defaultProps} status="IN_REVIEW" />);
      const badge = screen.getByText("In Review").closest("button");
      expect(screen.getByText("In Review")).toBeInTheDocument();
      expect(badge).toHaveClass("bg-purple/10");
    });

    it("renders DONE status with correct styling", () => {
      render(<TaskStatusBadge {...defaultProps} status="DONE" />);
      const badge = screen.getByText("Done").closest("button");
      expect(screen.getByText("Done")).toBeInTheDocument();
      expect(badge).toHaveClass("bg-success/10");
    });

    it("renders BLOCKED status with correct styling", () => {
      render(<TaskStatusBadge {...defaultProps} status="BLOCKED" />);
      const badge = screen.getByText("Blocked").closest("button");
      expect(screen.getByText("Blocked")).toBeInTheDocument();
      expect(badge).toHaveClass("bg-danger/10");
    });

    it("renders CANCELLED status with correct styling", () => {
      render(<TaskStatusBadge {...defaultProps} status="CANCELLED" />);
      const badge = screen.getByText("Cancelled").closest("button");
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
      expect(badge).toHaveClass("bg-muted");
    });

    it("applies custom className", () => {
      render(<TaskStatusBadge {...defaultProps} className="custom-class" />);
      const badge = screen.getByText("To Do").closest("button");
      expect(badge).toHaveClass("custom-class");
    });

    it("hides icon when showIcon is false", () => {
      render(<TaskStatusBadge {...defaultProps} showIcon={false} />);
      const badge = screen.getByText("To Do").closest("button");
      // Check that status icon is hidden but dropdown arrow is still shown
      const icons = badge?.querySelectorAll("svg");
      expect(icons?.length).toBe(1); // Only the dropdown arrow
    });
  });

  describe("Size Variants", () => {
    it("renders small size", () => {
      render(<TaskStatusBadge {...defaultProps} size="sm" />);
      const badge = screen.getByText("To Do").closest("button");
      expect(badge).toHaveClass("text-xs", "px-2", "py-0.5");
    });

    it("renders medium size (default)", () => {
      render(<TaskStatusBadge {...defaultProps} size="md" />);
      const badge = screen.getByText("To Do").closest("button");
      expect(badge).toHaveClass("text-xs", "px-2.5", "py-1");
    });

    it("renders large size", () => {
      render(<TaskStatusBadge {...defaultProps} size="lg" />);
      const badge = screen.getByText("To Do").closest("button");
      expect(badge).toHaveClass("text-sm", "px-3", "py-1.5");
    });
  });

  describe("Status Transitions", () => {
    it("shows valid transitions for TODO status", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      await user.click(screen.getByRole("button", { name: /task status: to do/i }));

      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
      expect(screen.queryByText("In Review")).not.toBeInTheDocument();
    });

    it("shows valid transitions for IN_PROGRESS status", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="IN_PROGRESS" />);

      await user.click(screen.getByRole("button", { name: /task status: in progress/i }));

      expect(screen.getByText("In Review")).toBeInTheDocument();
      expect(screen.getByText("Blocked")).toBeInTheDocument();
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
      expect(screen.queryByText("To Do")).not.toBeInTheDocument();
    });

    it("shows valid transitions for IN_REVIEW status", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="IN_REVIEW" />);

      await user.click(screen.getByRole("button", { name: /task status: in review/i }));

      expect(screen.getByText("Done")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.queryByText("Blocked")).not.toBeInTheDocument();
    });

    it("shows valid transitions for BLOCKED status", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="BLOCKED" />);

      await user.click(screen.getByRole("button", { name: /task status: blocked/i }));

      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });

    it("shows no transitions for DONE status", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="DONE" />);

      const button = screen.getByRole("button", { name: /task status: done/i });
      expect(button).toBeDisabled();
    });

    it("shows no transitions for CANCELLED status", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="CANCELLED" />);

      const button = screen.getByRole("button", { name: /task status: cancelled/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Status Update API", () => {
    it("calls API to update status when option is clicked", async () => {
      const user = userEvent.setup();
      const onStatusChange = jest.fn();
      mockTasksApi.update.mockResolvedValue({} as any);

      render(<TaskStatusBadge {...defaultProps} status="TODO" onStatusChange={onStatusChange} />);

      await user.click(screen.getByRole("button", { name: /task status: to do/i }));
      await user.click(screen.getByText("In Progress"));

      expect(mockTasksApi.update).toHaveBeenCalledWith("task-123", { status: "IN_PROGRESS" });
      expect(onStatusChange).toHaveBeenCalledWith("IN_PROGRESS");
    });

    it("shows loading state during API call", async () => {
      const user = userEvent.setup();
      mockTasksApi.update.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({} as any), 100))
      );

      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      await user.click(screen.getByRole("button", { name: /task status: to do/i }));
      const inProgressButton = screen.getByText("In Progress");
      await user.click(inProgressButton);

      // The dropdown option should be disabled during loading
      await waitFor(() => {
        expect(inProgressButton.closest("button")).toBeDisabled();
      });
    });

    it("shows error message when API call fails", async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockTasksApi.update.mockRejectedValue(new Error("Network error"));

      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      await user.click(screen.getByRole("button", { name: /task status: to do/i }));
      await user.click(screen.getByText("In Progress"));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Network error");
      });

      consoleError.mockRestore();
    });

    it("closes dropdown after successful status update", async () => {
      const user = userEvent.setup();
      mockTasksApi.update.mockResolvedValue({} as any);

      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      await user.click(screen.getByRole("button", { name: /task status: to do/i }));
      await user.click(screen.getByText("In Progress"));

      await waitFor(() => {
        expect(screen.queryByText("In Progress")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);
      const button = screen.getByRole("button", { name: /task status: to do/i });
      expect(button).toHaveAttribute(
        "aria-label",
        "Task status: To Do. Press Enter or Space to change."
      );
    });

    it("has aria-expanded attribute", () => {
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("updates aria-expanded when dropdown opens", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it('has aria-haspopup="listbox"', () => {
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);
      expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "listbox");
    });

    it("closes dropdown on Escape key", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("opens dropdown on Enter key", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens dropdown on Space key", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("Interactive Mode", () => {
    it("is not interactive when interactive prop is false", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" interactive={false} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("is not interactive when disabled prop is true", async () => {
      const user = userEvent.setup();
      render(<TaskStatusBadge {...defaultProps} status="TODO" disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Click Outside", () => {
    it("closes dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <TaskStatusBadge {...defaultProps} status="TODO" />
          <div data-testid="outside">Outside</div>
        </div>
      );

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.click(screen.getByTestId("outside"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});
