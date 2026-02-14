'use client';

import { Card as CardType, TYPE_ICONS, PRIORITY_COLORS, ASSIGNEE_STYLES } from '@/lib/types';
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
        'group relative bg-card rounded-lg border border-border/50 p-3.5 cursor-pointer',
        'hover:shadow-md hover:border-border transition-all duration-200',
        'shadow-sm',
        isDragging && 'opacity-60 rotate-1 scale-105 shadow-lg'
      )}
    >
      {/* Type Icon & Title */}
      <div className="flex items-start gap-2.5">
        <span className="text-sm flex-shrink-0 mt-0.5">{TYPE_ICONS[card.type]}</span>
        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1">
          {card.title}
        </h3>
        {/* Priority dot */}
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', PRIORITY_COLORS[card.priority])} />
      </div>

      {/* Description preview */}
      {card.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 pl-[26px]">
          {card.description}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Due date */}
          {dueDate && (
            <span
              className={cn(
                'text-[11px] px-1.5 py-0.5 rounded-md font-medium',
                isOverdue && 'bg-red-50 text-red-600',
                isDueToday && 'bg-amber-50 text-amber-600',
                isDueTomorrow && 'bg-yellow-50 text-yellow-600',
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
                'text-[11px] px-1.5 py-0.5 rounded-md font-medium',
                completedChecklist === totalChecklist ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
              )}
            >
              ✓ {completedChecklist}/{totalChecklist}
            </span>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <span className="text-[11px] text-muted-foreground font-medium">
              #{card.tags[0]}
              {card.tags.length > 1 && ` +${card.tags.length - 1}`}
            </span>
          )}
        </div>

        {/* Assignee */}
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
            ASSIGNEE_STYLES[card.assignee].className
          )}
        >
          {ASSIGNEE_STYLES[card.assignee].label}
        </div>
      </div>
    </div>
  );
}
