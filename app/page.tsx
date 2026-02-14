import { Board } from '@/components/board';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-[56px] border-b border-border/60 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Pulse Board
        </h1>
        <span className="text-xs text-muted-foreground">Jorge & Natasha</span>
      </header>

      {/* Board */}
      <Board />
    </main>
  );
}
