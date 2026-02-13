'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as CardType, ColumnType } from '@/lib/types';
import { SortableCard } from './SortableCard';
import { AddCard } from './AddCard';
import { cn } from '@/lib/utils';

interface ColumnProps {
  id: ColumnType;
  title: string;
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  onAddCard: (card: Partial<CardType>) => Promise<void>;
}

export function Column({ id, title, cards, onCardClick, onAddCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      columnId: id,
    },
  });

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[100px] rounded-lg transition-colors',
          isOver && 'bg-muted/50'
        )}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>

        {/* Add Card */}
        <AddCard columnId={id} onAdd={onAddCard} />
      </div>
    </div>
  );
}
