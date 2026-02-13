import { Board } from '@/components/board';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-[60px] border-b border-border flex items-center px-6">
        <h1 className="text-xl font-bold text-foreground">
          <span className="text-primary">Pulse</span> Board
        </h1>
      </header>

      {/* Board */}
      <Board />
    </main>
  );
}
