'use client';

import { Card as CardType, TYPE_ICONS, PRIORITY_BORDER_COLORS, ASSIGNEE_STYLES } from '@/lib/types';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardType;
  onClick: () => void;
  isDragging?: boolean;
}

export function Card({ card, onClick, isDragging }: CardProps) {
  const dueDate = card.due_date ? new Date(card.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const isDueTomorrow = dueDate && isTomorrow(dueDate);

  const completedChecklist = card.checklist.filter(item => item.done).length;
  const totalChecklist = card.checklist.length;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-card rounded-lg border border-border p-3 cursor-pointer',
        'hover:border-muted-foreground/50 transition-all duration-200',
        'border-l-4',
        PRIORITY_BORDER_COLORS[card.priority],
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg'
      )}
    >
      {/* Type Icon & Title */}
      <div className="flex items-start gap-2">
        <span className="text-sm flex-shrink-0">{TYPE_ICONS[card.type]}</span>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
          {card.title}
        </h3>
      </div>

      {/* Description preview */}
      {card.description && (
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 pl-6">
          {card.description}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Due date */}
          {dueDate && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                isOverdue && 'bg-red-500/20 text-red-400',
                isDueToday && 'bg-orange-500/20 text-orange-400',
                isDueTomorrow && 'bg-yellow-500/20 text-yellow-400',
                !isOverdue && !isDueToday && !isDueTomorrow && 'bg-muted text-muted-foreground'
              )}
            >
              {isOverdue && 'Overdue'}
              {isDueToday && 'Today'}
              {isDueTomorrow && 'Tomorrow'}
              {!isOverdue && !isDueToday && !isDueTomorrow && format(dueDate, 'MMM d')}
            </span>
          )}

          {/* Checklist progress */}
          {totalChecklist > 0 && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded bg-muted',
                completedChecklist === totalChecklist ? 'text-green-400' : 'text-muted-foreground'
              )}
            >
              ✓ {completedChecklist}/{totalChecklist}
            </span>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <span className="text-xs text-muted-foreground">
              #{card.tags[0]}
              {card.tags.length > 1 && ` +${card.tags.length - 1}`}
            </span>
          )}
        </div>

        {/* Assignee */}
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
            ASSIGNEE_STYLES[card.assignee].className
          )}
        >
          {ASSIGNEE_STYLES[card.assignee].label}
        </div>
      </div>
    </div>
  );
}
