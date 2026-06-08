import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for Recharts ResponsiveContainer in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for Framer Motion in jsdom
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for Radix UI Select in jsdom
Element.prototype.scrollIntoView = function () {};
Element.prototype.scrollTo = function () {};

// Mock matchMedia for sonner Toaster / next-themes in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
