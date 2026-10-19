import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameSession } from './GameSession';
import { PILOT_QUESTIONS, poolAvailability, type PairCard } from '@/lib/bank';

const captured = vi.hoisted(() => ({ sets: [] as PairCard[][] }));
vi.mock('./PairGames', () => ({
  MemoryPairs: ({ set }: { set: PairCard[] }) => { captured.sets.push(set); return null; },
  MatchArena: () => null,
}));

describe('memory session identity', () => {
  it('keeps the same four-card pair pool across progress-triggered rerenders', () => {
    const pool = PILOT_QUESTIONS.filter(q => q.eligible_games.includes('memory_pairs'));
    const props = { mode: 'memory_pairs', pool, avail: poolAvailability(pool), missions: [], grade: null, term: null, back: null, missionLink: () => null };
    const view = render(<GameSession {...props} />);
    view.rerender(<GameSession {...props} />);
    expect(captured.sets[0]).toHaveLength(4);
    expect(captured.sets[1]).toBe(captured.sets[0]);
    view.unmount();
  });
});