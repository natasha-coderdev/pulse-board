'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, ColumnType, ChecklistItem } from '@/lib/types';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all cards
  const fetchCards = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      
      // Parse checklist from JSON if needed
      const parsedCards = (data || []).map(card => ({
        ...card,
        checklist: typeof card.checklist === 'string' 
          ? JSON.parse(card.checklist) 
          : (card.checklist || []),
        tags: card.tags || [],
      }));
      
      setCards(parsedCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new card
  const createCard = useCallback(async (card: Partial<Card>) => {
    try {
      // Get the max position for the column
      const columnCards = cards.filter(c => c.column_name === card.column_name);
      const maxPosition = columnCards.length > 0 
        ? Math.max(...columnCards.map(c => c.position)) + 1 
        : 0;

      const newCard = {
        title: card.title || 'Untitled',
        description: card.description || '',
        type: card.type || 'task',
        column_name: card.column_name || 'inbox',
        assignee: card.assignee || 'jorge',
        priority: card.priority || 'medium',
        due_date: card.due_date || null,
        tags: card.tags || [],
        checklist: card.checklist || [],
        output: card.output || null,
        position: maxPosition,
      };

      const { data, error } = await supabase
        .from('cards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;
      
      const parsedCard = {
        ...data,
        checklist: typeof data.checklist === 'string' 
          ? JSON.parse(data.checklist) 
          : (data.checklist || []),
        tags: data.tags || [],
      };
      
      setCards(prev => [...prev, parsedCard]);
      return parsedCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
      throw err;
    }
  }, [cards]);

  // Update a card
  const updateCard = useCallback(async (id: string, updates: Partial<Card>) => {
    try {
      // Optimistic update
      setCards(prev => prev.map(card => 
        card.id === id ? { ...card, ...updates } : card
      ));

      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Revert on error
        await fetchCards();
        throw error;
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card');
      throw err;
    }
  }, [fetchCards]);

  // Delete a card
  const deleteCard = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setCards(prev => prev.filter(card => card.id !== id));

      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) {
        await fetchCards();
        throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
      throw err;
    }
  }, [fetchCards]);

  // Move card to a different column or position
  const moveCard = useCallback(async (
    cardId: string,
    targetColumn: ColumnType,
    targetPosition: number
  ) => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card) return;

      const sourceColumn = card.column_name;
      
      // Optimistic update
      setCards(prev => {
        const updated = [...prev];
        const cardIndex = updated.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return prev;

        // Update the moved card
        updated[cardIndex] = {
          ...updated[cardIndex],
          column_name: targetColumn,
          position: targetPosition,
        };

        // Reorder cards in target column
        const targetCards = updated
          .filter(c => c.column_name === targetColumn && c.id !== cardId)
          .sort((a, b) => a.position - b.position);
        
        // Insert moved card at target position
        targetCards.splice(targetPosition, 0, updated[cardIndex]);
        
        // Update positions
        targetCards.forEach((c, i) => {
          const idx = updated.findIndex(u => u.id === c.id);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], position: i };
          }
        });

        // If moving to different column, reorder source column
        if (sourceColumn !== targetColumn) {
          const sourceCards = updated
            .filter(c => c.column_name === sourceColumn)
            .sort((a, b) => a.position - b.position);
          
          sourceCards.forEach((c, i) => {
            const idx = updated.findIndex(u => u.id === c.id);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], position: i };
            }
          });
        }

        return updated;
      });

      // Update in database
      const updates: { id: string; column_name: ColumnType; position: number }[] = [];
      
      const newCards = [...cards];
      const cardIndex = newCards.findIndex(c => c.id === cardId);
      if (cardIndex !== -1) {
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          column_name: targetColumn,
          position: targetPosition,
        };
      }

      // Get all cards that need position updates
      const affectedCards = newCards
        .filter(c => c.column_name === targetColumn || c.column_name === sourceColumn)
        .sort((a, b) => {
          if (a.column_name !== b.column_name) return 0;
          return a.position - b.position;
        });

      // Group by column and assign new positions
      const columnGroups: Record<string, Card[]> = {};
      affectedCards.forEach(c => {
        if (!columnGroups[c.column_name]) columnGroups[c.column_name] = [];
        columnGroups[c.column_name].push(c);
      });

      for (const column of Object.keys(columnGroups)) {
        const colCards = columnGroups[column]
          .filter(c => c.id !== cardId)
          .sort((a, b) => a.position - b.position);
        
        if (column === targetColumn) {
          colCards.splice(targetPosition, 0, newCards.find(c => c.id === cardId)!);
        }
        
        colCards.forEach((c, i) => {
          if (c.position !== i || c.column_name !== column) {
            updates.push({ 
              id: c.id, 
              column_name: column as ColumnType, 
              position: i 
            });
          }
        });
      }

      // Batch update
      for (const update of updates) {
        await supabase
          .from('cards')
          .update({ column_name: update.column_name, position: update.position })
          .eq('id', update.id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move card');
      await fetchCards();
    }
  }, [cards, fetchCards]);

  // Add checklist item
  const addChecklistItem = useCallback(async (cardId: string, text: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      done: false,
    };

    const newChecklist = [...card.checklist, newItem];
    await updateCard(cardId, { checklist: newChecklist });
  }, [cards, updateCard]);

  // Toggle checklist item
  const toggleChecklistItem = useCallback(async (cardId: string, itemId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newChecklist = card.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    await updateCard(cardId, { checklist: newChecklist });
  }, [cards, updateCard]);

  // Delete checklist item
  const deleteChecklistItem = useCallback(async (cardId: string, itemId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newChecklist = card.checklist.filter(item => item.id !== itemId);
    await updateCard(cardId, { checklist: newChecklist });
  }, [cards, updateCard]);

  // Setup realtime subscription
  useEffect(() => {
    fetchCards();

    const channel = supabase
      .channel('cards-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCard = {
              ...payload.new,
              checklist: typeof payload.new.checklist === 'string'
                ? JSON.parse(payload.new.checklist)
                : (payload.new.checklist || []),
              tags: payload.new.tags || [],
            } as Card;
            setCards(prev => {
              if (prev.some(c => c.id === newCard.id)) return prev;
              return [...prev, newCard];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedCard = {
              ...payload.new,
              checklist: typeof payload.new.checklist === 'string'
                ? JSON.parse(payload.new.checklist)
                : (payload.new.checklist || []),
              tags: payload.new.tags || [],
            } as Card;
            setCards(prev => prev.map(card =>
              card.id === updatedCard.id ? updatedCard : card
            ));
          } else if (payload.eventType === 'DELETE') {
            setCards(prev => prev.filter(card => card.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCards]);

  // Get cards grouped by column
  const getCardsByColumn = useCallback((columnId: ColumnType) => {
    return cards
      .filter(card => card.column_name === columnId)
      .sort((a, b) => a.position - b.position);
  }, [cards]);

  return {
    cards,
    loading,
    error,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    getCardsByColumn,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  };
}
