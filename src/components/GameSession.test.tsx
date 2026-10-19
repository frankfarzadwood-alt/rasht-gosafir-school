import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameSession } from './GameSession';
import { PILOT_QUESTIONS as ALL_BOOK, poolAvailability, type PairCard } from '@/lib/bank';
import snapshot from '@/test/fixtures/pilot200.pack.json';

const PILOT_IDS = new Set(snapshot.questions.map(q => q.id));
const PILOT_QUESTIONS = ALL_BOOK.filter(q => PILOT_IDS.has(q.id));

const captured = vi.hoisted(() => ({ sets: [] as PairCard[][] }));
vi.mock('./GameRunner', () => ({ GameRunner: ({ context }: { context?: { id: string } }) => <div data-testid="passage">{context?.id}</div> }));
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
  it('lets a learner reach all three reviewed reading passages', () => {
    const pool = PILOT_QUESTIONS;
    const view = render(<GameSession mode="reading_explorer" pool={pool} avail={poolAvailability(pool)} missions={[]} grade={null} term={null} back={null} missionLink={() => null} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    const ids = new Set<string>();
    for (const button of buttons) { fireEvent.click(button); ids.add(screen.getByTestId('passage').textContent ?? ''); }
    expect(ids.size).toBe(3);
    view.unmount();
  });
});