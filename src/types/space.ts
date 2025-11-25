export interface Space {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  adminList: string[];
  usersList: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  color: string;
  items: TodoItem[];
  createdBy: string;
  defaultAdmin: string;
  adminList: string[];
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { Space as ISpace, Task as ITask };
