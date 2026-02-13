'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Plus, Calendar, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Card,
  CardType,
  ColumnType,
  Priority,
  Assignee,
  TYPE_ICONS,
  COLUMNS,
  PRIORITY_COLORS,
  ASSIGNEE_STYLES,
} from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CardDetailProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Card>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddChecklistItem: (cardId: string, text: string) => Promise<void>;
  onToggleChecklistItem: (cardId: string, itemId: string) => Promise<void>;
  onDeleteChecklistItem: (cardId: string, itemId: string) => Promise<void>;
}

export function CardDetail({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
}: CardDetailProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setOutput(card.output || '');
      setDueDate(card.due_date ? format(new Date(card.due_date), "yyyy-MM-dd'T'HH:mm") : '');
    }
  }, [card]);

  if (!card) return null;

  const handleTitleBlur = () => {
    if (title !== card.title && title.trim()) {
      onUpdate(card.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (card.description || '')) {
      onUpdate(card.id, { description });
    }
  };

  const handleOutputBlur = () => {
    if (output !== (card.output || '')) {
      onUpdate(card.id, { output });
    }
  };

  const handleDueDateChange = (value: string) => {
    setDueDate(value);
    onUpdate(card.id, { due_date: value ? new Date(value).toISOString() : undefined });
  };

  const clearDueDate = () => {
    setDueDate('');
    onUpdate(card.id, { due_date: undefined });
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      onAddChecklistItem(card.id, newChecklistItem.trim());
      setNewChecklistItem('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !card.tags.includes(newTag.trim())) {
      onUpdate(card.id, { tags: [...card.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onUpdate(card.id, { tags: card.tags.filter(t => t !== tag) });
  };

  const handleDelete = async () => {
    await onDelete(card.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const completedItems = card.checklist.filter(item => item.done).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader className="pr-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{TYPE_ICONS[card.type]}</span>
            <DialogTitle className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-xl font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                placeholder="Card title"
              />
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Meta Row */}
          <div className="flex flex-wrap gap-3">
            {/* Type */}
            <Select
              value={card.type}
              onValueChange={(v) => onUpdate(card.id, { type: v as CardType })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">✅ Task</SelectItem>
                <SelectItem value="idea">💡 Idea</SelectItem>
                <SelectItem value="plan">📋 Plan</SelectItem>
                <SelectItem value="reminder">⏰ Reminder</SelectItem>
              </SelectContent>
            </Select>

            {/* Column */}
            <Select
              value={card.column_name}
              onValueChange={(v) => onUpdate(card.id, { column_name: v as ColumnType })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map(col => (
                  <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority */}
            <Select
              value={card.priority}
              onValueChange={(v) => onUpdate(card.id, { priority: v as Priority })}
            >
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', PRIORITY_COLORS[card.priority])} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    High
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Urgent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Assignee */}
            <Select
              value={card.assignee}
              onValueChange={(v) => onUpdate(card.id, { assignee: v as Assignee })}
            >
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                    ASSIGNEE_STYLES[card.assignee].className
                  )}>
                    {ASSIGNEE_STYLES[card.assignee].label}
                  </div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jorge">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">J</div>
                    Jorge
                  </div>
                </SelectItem>
                <SelectItem value="natasha">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">N</div>
                    Natasha
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">JN</div>
                    Both
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="flex-1"
              />
              {dueDate && (
                <Button variant="ghost" size="sm" onClick={clearDueDate}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {card.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer group">
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6">
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tag name"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleAddTag} className="h-8">
                      Add
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Checklist
                {card.checklist.length > 0 && (
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({completedItems}/{card.checklist.length})
                  </span>
                )}
              </label>
            </div>
            
            {/* Progress bar */}
            {card.checklist.length > 0 && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(completedItems / card.checklist.length) * 100}%` }}
                />
              </div>
            )}

            <div className="space-y-1">
              {card.checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => onToggleChecklistItem(card.id, item.id)}
                  />
                  <span className={cn(
                    'flex-1 text-sm',
                    item.done && 'line-through text-muted-foreground'
                  )}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => onDeleteChecklistItem(card.id, item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddChecklistItem} disabled={!newChecklistItem.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Output / Deliverables</label>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              onBlur={handleOutputBlur}
              placeholder="Results, deliverables, or notes..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Timestamps */}
          <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
            <span>Created: {format(new Date(card.created_at), 'MMM d, yyyy h:mm a')}</span>
            <span>Updated: {format(new Date(card.updated_at), 'MMM d, yyyy h:mm a')}</span>
          </div>

          {/* Delete */}
          <div className="pt-4 border-t border-border">
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete card
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this card?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  Yes, delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
