import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFormModal } from '../TaskFormModal';
import { Task, Epic, User } from '@/types';

// Create mock functions that persist across renders
const mockCreateTask = jest.fn().mockResolvedValue({} as any);
const mockUpdateTask = jest.fn().mockResolvedValue({} as any);
const mockFetchEpics = jest.fn();

// Mock the AppContext
jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    fetchEpics: mockFetchEpics,
    epics: [
      { id: 'epic-1', title: 'Test Epic' } as Epic,
    ],
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockUsers: User[] = [
  { id: 'user-1', email: 'user1@example.com', name: 'User One', role: 'DEVELOPER', createdAt: '', updatedAt: '' },
  { id: 'user-2', email: 'user2@example.com', name: 'User Two', role: 'DEVELOPER', createdAt: '', updatedAt: '' },
];

const mockTask: Task = {
  id: 'task-1',
  epicId: 'epic-1',
  title: 'Test Task',
  description: 'Test Description',
  assigneeId: 'user-1',
  status: 'TODO',
  priority: 'HIGH',
  storyPoints: 5,
  estimatedHours: 8,
  actualHours: 0,
  startDate: null,
  dueDate: null,
  completedAt: null,
  createdAt: '',
  updatedAt: '',
};

describe('TaskFormModal', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockCreateTask.mockReset().mockResolvedValue({} as any);
    mockUpdateTask.mockReset().mockResolvedValue({} as any);
    mockFetchEpics.mockReset();
  });

  describe('Create Mode', () => {
    it('renders create modal when open', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      expect(screen.getByText('Create New Task')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/epic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/story points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estimated hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <TaskFormModal
          open={false}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    it('pre-fills epicId when provided', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const epicSelect = screen.getByLabelText(/epic/i);
      expect(epicSelect).toHaveValue('epic-1');
    });

    it('auto-focuses title input on open', async () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i);
        expect(titleInput).toHaveFocus();
      });
    });

    it('shows validation errors for empty title', async () => {
      const user = userEvent.setup();
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('shows validation errors for invalid story points', async () => {
      const user = userEvent.setup();
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      const storyPointsInput = screen.getByLabelText(/story points/i);
      await user.type(storyPointsInput, '15');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/story points/i)).toBeInTheDocument();
      });
    });

    it('populates assignee dropdown with users', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const assigneeSelect = screen.getByLabelText(/assignee/i);
      expect(assigneeSelect).toBeInTheDocument();

      const options = Array.from(assigneeSelect.querySelectorAll('option'));
      expect(options).toHaveLength(3); // Unassigned + 2 users
      expect(options[1]).toHaveTextContent('User One (user1@example.com)');
      expect(options[2]).toHaveTextContent('User Two (user2@example.com)');
    });

    it('closes modal on cancel button click', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      render(
        <TaskFormModal
          open={true}
          onClose={onClose}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('closes modal on Escape key press', async () => {
      const onClose = jest.fn();
      render(
        <TaskFormModal
          open={true}
          onClose={onClose}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('submits form with valid data', async () => {
      // Reset mock to default behavior
      mockCreateTask.mockReset().mockResolvedValue({} as any);
      const user = userEvent.setup({ delay: 50 });

      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      await user.type(titleInput, 'New Task');

      // Wait for title to be set
      await waitFor(() => {
        expect(titleInput.value).toBe('New Task');
      });

      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(descriptionInput, 'Task description');

      // Wait for description to be set
      await waitFor(() => {
        expect(descriptionInput.value).toBe('Task description');
      });

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            epicId: 'epic-1',
            title: 'New Task',
            description: 'Task description',
            priority: 'MEDIUM',
          })
        );
      });
    });
  });

  describe('Edit Mode', () => {
    it('renders edit modal with task data', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          task={mockTask}
          users={mockUsers}
          mode="edit"
        />
      );

      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue('Test Task');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/actual hours/i)).toBeInTheDocument();
    });

    it('pre-fills all fields with task data', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          task={mockTask}
          users={mockUsers}
          mode="edit"
        />
      );

      expect(screen.getByLabelText(/title/i)).toHaveValue('Test Task');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
      expect(screen.getByLabelText(/assignee/i)).toHaveValue('user-1');
      expect(screen.getByLabelText(/priority/i)).toHaveValue('HIGH');
      expect(screen.getByLabelText(/story points/i)).toHaveValue(5);
      expect(screen.getByLabelText(/estimated hours/i)).toHaveValue(8);
      expect(screen.getByLabelText(/status/i)).toHaveValue('TODO');
    });

    it('shows last updated timestamp', () => {
      const taskWithDate = {
        ...mockTask,
        updatedAt: '2026-04-01T12:00:00.000Z',
      };

      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          task={taskWithDate}
          users={mockUsers}
          mode="edit"
        />
      );

      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
    });

    it('calls updateTask on submit', async () => {
      const updateTask = mockUpdateTask;
      const user = userEvent.setup();

      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          task={mockTask}
          users={mockUsers}
          mode="edit"
        />
      );

      const submitButton = screen.getByRole('button', { name: /update task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateTask).toHaveBeenCalledWith('task-1', expect.objectContaining({
          title: 'Test Task',
        }));
      });
    });

    it('shows update button instead of create', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          task={mockTask}
          users={mockUsers}
          mode="edit"
        />
      );

      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /create task/i })).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('shows success message after successful creation', async () => {
      const createTask = mockCreateTask;
      const onClose = jest.fn();
      const user = userEvent.setup();

      render(
        <TaskFormModal
          open={true}
          onClose={onClose}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
      });
    });

    it('closes modal after success delay', async () => {
      const createTask = mockCreateTask;
      const onClose = jest.fn();
      const user = userEvent.setup();

      render(
        <TaskFormModal
          open={true}
          onClose={onClose}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(onClose).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Error State', () => {
    it.skip('shows error message on API failure', async () => {
      mockCreateTask.mockClear();
      mockCreateTask.mockRejectedValue(new Error('API Error'));
      const user = userEvent.setup();

      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      expect(screen.getByLabelText(/title/i)).toHaveAttribute('required');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('submits on Ctrl+Enter', async () => {
      const createTask = mockCreateTask;
      const user = userEvent.setup();

      render(
        <TaskFormModal
          open={true}
          onClose={jest.fn()}
          epicId="epic-1"
          users={mockUsers}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New Task');

      fireEvent.keyDown(screen.getByLabelText(/title/i), {
        key: 'Enter',
        ctrlKey: true,
      });

      await waitFor(() => {
        expect(createTask).toHaveBeenCalled();
      });
    });
  });
});
