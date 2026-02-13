export type CardType = 'idea' | 'task' | 'plan' | 'reminder';
export type ColumnType = 'inbox' | 'planned' | 'in_progress' | 'waiting' | 'done' | 'parked';
export type Assignee = 'jorge' | 'natasha' | 'both';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  type: CardType;
  column_name: ColumnType;
  assignee: Assignee;
  priority: Priority;
  due_date?: string;
  tags: string[];
  checklist: ChecklistItem[];
  output?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: ColumnType;
  title: string;
  cards: Card[];
}

export const COLUMNS: { id: ColumnType; title: string }[] = [
  { id: 'inbox', title: 'Inbox' },
  { id: 'planned', title: 'Planned' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'waiting', title: 'Waiting' },
  { id: 'done', title: 'Done' },
  { id: 'parked', title: 'Parked' },
];

export const TYPE_ICONS: Record<CardType, string> = {
  idea: '💡',
  task: '✅',
  plan: '📋',
  reminder: '⏰',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export const PRIORITY_BORDER_COLORS: Record<Priority, string> = {
  low: 'border-l-gray-500',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

export const ASSIGNEE_STYLES: Record<Assignee, { label: string; className: string }> = {
  jorge: { label: 'J', className: 'bg-blue-600 text-white' },
  natasha: { label: 'N', className: 'bg-purple-600 text-white' },
  both: { label: 'JN', className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' },
};
