// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom'; // Ensure Jest DOM matchers are available
import { useLocation, useHistory } from 'react-router-dom';

import { vi } from 'vitest'

// Mocking the EventSource API (used for Notifications, but also useful for any server-sent events)
// the testing environment does not support EventSource, so we mock it.
global.EventSource = class {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onerror = null;
  }
  close() {
    // Mock close method
    // this.onmessage = null;
    // this.onerror = null;
  }
};


// Mocking the scrollTo method on HTMLElements for PaginatedList and maybe other components
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

