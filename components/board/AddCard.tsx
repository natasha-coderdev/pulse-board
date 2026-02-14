'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnType, CardType, Priority, Assignee } from '@/lib/types';

interface AddCardProps {
  columnId: ColumnType;
  onAdd: (card: {
    title: string;
    column_name: ColumnType;
    type: CardType;
    priority: Priority;
    assignee: Assignee;
  }) => Promise<void>;
}

export function AddCard({ columnId, onAdd }: AddCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CardType>('task');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState<Assignee>('jorge');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        column_name: columnId,
        type,
        priority,
        assignee,
      });
      setTitle('');
      setType('task');
      setPriority('medium');
      setAssignee('jorge');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add card
      </button>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border/50 shadow-sm p-3 space-y-3">
      <Input
        autoFocus
        placeholder="Card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-sm"
      />
      
      <div className="flex gap-2 flex-wrap">
        <Select value={type} onValueChange={(v) => setType(v as CardType)}>
          <SelectTrigger className="w-[100px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task">✅ Task</SelectItem>
            <SelectItem value="idea">💡 Idea</SelectItem>
            <SelectItem value="plan">📋 Plan</SelectItem>
            <SelectItem value="reminder">⏰ Reminder</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger className="w-[100px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignee} onValueChange={(v) => setAssignee(v as Assignee)}>
          <SelectTrigger className="w-[90px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jorge">Jorge</SelectItem>
            <SelectItem value="natasha">Natasha</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          className="flex-1 h-8 text-xs"
        >
          {isSubmitting ? 'Adding...' : 'Add card'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(false)}
          className="h-8"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
