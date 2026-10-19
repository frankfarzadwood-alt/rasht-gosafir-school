// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Flashcards } from './Flashcards';
const cards = ['pencil', 'island'].map((lemma, i) => ({ id: `q${i}`, questionId: `q${i}`, lemma, meaning: `Meaning ${i}`, reviewer: 'assistant' }));
afterEach(cleanup);
it('requires reveal, revisits only self-rated difficult cards and never writes learner storage', () => {
  localStorage.setItem('english-quest-progress-v1', '{"unchanged":true}');
  render(<Flashcards cards={cards} seed={.2} back={<a href="/learn">بازگشت</a>} />);
  fireEvent.click(screen.getByRole('button', { name: 'مرور همهٔ کارت‌ها' }));
  expect(screen.getByRole('button', { name: 'بلد بودم' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'نمایش معنی' }));
  const difficult = screen.getByRole('button', { name: 'کارت برگشته است' }).textContent;
  fireEvent.click(screen.getByRole('button', { name: 'نیاز به تمرین دارم' }));
  expect(screen.getByRole('button', { name: 'بلد بودم' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'نمایش معنی' }));
  fireEvent.click(screen.getByRole('button', { name: 'بلد بودم' }));
  fireEvent.click(screen.getByRole('button', { name: 'مرور کارت‌های نیازمند تمرین' }));
  fireEvent.click(screen.getByRole('button', { name: 'نمایش معنی' }));
  expect(screen.getByRole('button', { name: 'کارت برگشته است' }).textContent).toBe(difficult);
  fireEvent.click(screen.getByRole('button', { name: 'بلد بودم' }));
  expect(screen.queryByRole('button', { name: 'مرور کارت‌های نیازمند تمرین' })).toBeNull();
  expect(localStorage.getItem('english-quest-progress-v1')).toBe('{"unchanged":true}');
});
it('supports meaning-first recall', () => {
  render(<Flashcards cards={cards} seed={.2} back={null} />);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'مرور همهٔ کارت‌ها' }));
  expect(screen.getByRole('button', { name: 'نمایش واژه' }).textContent).toMatch(/Meaning/);
  fireEvent.click(screen.getByRole('button', { name: 'نمایش واژه' }));
  expect(screen.getByRole('button', { name: 'کارت برگشته است' }).textContent).toMatch(/pencil|island/);
});
