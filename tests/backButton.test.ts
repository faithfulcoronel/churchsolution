import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performGoBack } from '../src/components/BackButton';

declare let global: any;

describe('performGoBack', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    global.window = { history: { length: 0 } };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('navigates back when history length > 1', () => {
    global.window.history.length = 2;
    const navigate = vi.fn();
    performGoBack(navigate, '/fallback');
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('navigates to fallback when history length <= 1', () => {
    global.window.history.length = 1;
    const navigate = vi.fn();
    performGoBack(navigate, '/fallback');
    expect(navigate).toHaveBeenCalledWith('/fallback');
  });
});
