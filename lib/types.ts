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

// Kept for backward compat but cards now use PRIORITY_COLORS dots
export const PRIORITY_BORDER_COLORS: Record<Priority, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400',
};

export const ASSIGNEE_STYLES: Record<Assignee, { label: string; className: string }> = {
  jorge: { label: 'J', className: 'bg-blue-100 text-blue-700' },
  natasha: { label: 'N', className: 'bg-purple-100 text-purple-700' },
  both: { label: 'JN', className: 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700' },
};
