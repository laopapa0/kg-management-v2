import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for Recharts ResponsiveContainer in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for Radix UI Select in jsdom
Element.prototype.scrollIntoView = function () {};
Element.prototype.scrollTo = function () {};
