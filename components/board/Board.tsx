'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCards } from '@/hooks/useCards';
import { Card as CardType, COLUMNS, ColumnType } from '@/lib/types';
import { Column } from './Column';
import { Card } from './Card';
import { CardDetail } from './CardDetail';
import { Loader2 } from 'lucide-react';

export function Board() {
  const {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    getCardsByColumn,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useCards();

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for visual feedback
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = cards.find(c => c.id === activeId);
    if (!activeCard) return;

    // Determine target column and position
    let targetColumn: ColumnType;
    let targetPosition: number;

    // Check if dropped over a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);
    if (isOverColumn) {
      targetColumn = overId as ColumnType;
      const columnCards = getCardsByColumn(targetColumn);
      targetPosition = columnCards.length;
    } else {
      // Dropped over another card
      const overCard = cards.find(c => c.id === overId);
      if (!overCard) return;

      targetColumn = overCard.column_name;
      const columnCards = getCardsByColumn(targetColumn);
      targetPosition = columnCards.findIndex(c => c.id === overId);
      if (targetPosition === -1) targetPosition = columnCards.length;
    }

    // Skip if dropping in same position
    if (
      activeCard.column_name === targetColumn &&
      activeCard.position === targetPosition
    ) {
      return;
    }

    await moveCard(activeId, targetColumn, targetPosition);
  };

  const handleCardClick = useCallback((card: CardType) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedCard(null);
  }, []);

  const handleUpdateCard = useCallback(async (id: string, updates: Partial<CardType>) => {
    await updateCard(id, updates);
    // Update selected card if it's the one being updated
    if (selectedCard?.id === id) {
      setSelectedCard(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [updateCard, selectedCard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading cards</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 p-5 overflow-x-auto h-[calc(100vh-56px)]">
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={getCardsByColumn(column.id)}
              onCardClick={handleCardClick}
              onAddCard={createCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-[284px]">
              <Card card={activeCard} onClick={() => {}} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardDetail
        card={selectedCard}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateCard}
        onDelete={deleteCard}
        onAddChecklistItem={addChecklistItem}
        onToggleChecklistItem={toggleChecklistItem}
        onDeleteChecklistItem={deleteChecklistItem}
      />
    </>
  );
}
