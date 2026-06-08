import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher, { applyTheme, getStoredTheme, THEME_OPTIONS } from './ThemeSwitcher';

const THEME_KEY = 'kgv2-theme';

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStoredTheme', () => {
    it('returns dark when no theme is stored', () => {
      expect(getStoredTheme()).toBe('dark');
    });

    it('returns stored theme when valid', () => {
      localStorage.setItem(THEME_KEY, 'github-dark');
      expect(getStoredTheme()).toBe('github-dark');
    });

    it('falls back to dark when stored theme is invalid', () => {
      localStorage.setItem(THEME_KEY, 'invalid-theme');
      expect(getStoredTheme()).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    it('sets data-theme attribute on documentElement', () => {
      applyTheme('vercel-dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('vercel-dark');
    });

    it('persists theme to localStorage', () => {
      applyTheme('linear-dark');
      expect(localStorage.getItem(THEME_KEY)).toBe('linear-dark');
    });
  });

  describe('component rendering', () => {
    it('renders the palette trigger button', () => {
      render(<ThemeSwitcher />);
      expect(screen.getByLabelText('切换主题')).toBeInTheDocument();
    });

    it('opens dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitcher />);

      await user.click(screen.getByLabelText('切换主题'));
      expect(screen.getByRole('listbox', { name: '主题选择' })).toBeInTheDocument();
    });

    it('renders all 9 theme options in the dropdown', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitcher />);

      await user.click(screen.getByLabelText('切换主题'));

      const listbox = screen.getByRole('listbox', { name: '主题选择' });
      const options = within(listbox).getAllByRole('option');
      expect(options).toHaveLength(THEME_OPTIONS.length);
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ThemeSwitcher />
          <div data-testid="outside">outside</div>
        </div>
      );

      await user.click(screen.getByLabelText('切换主题'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('applies theme and closes dropdown when an option is clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitcher />);

      await user.click(screen.getByLabelText('切换主题'));
      const listbox = screen.getByRole('listbox');
      const githubOption = within(listbox).getByRole('option', { name: 'GitHub' });

      await user.click(githubOption);

      expect(document.documentElement.getAttribute('data-theme')).toBe('github-dark');
      expect(localStorage.getItem(THEME_KEY)).toBe('github-dark');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('shows current theme indicator on the selected option', async () => {
      localStorage.setItem(THEME_KEY, 'vercel-dark');
      const user = userEvent.setup();
      render(<ThemeSwitcher />);

      await user.click(screen.getByLabelText('切换主题'));
      const listbox = screen.getByRole('listbox');
      const options = within(listbox).getAllByRole('option');

      const selected = options.find((o) => o.getAttribute('aria-selected') === 'true');
      expect(selected).toBeDefined();
      expect(selected).toHaveAttribute('title', 'Vercel');
    });
  });
});
