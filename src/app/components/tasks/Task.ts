export interface Task {
  name: string;
  description: string;
  status: string;
  createdAt: string | null;
  dueDate: string | null;
}
