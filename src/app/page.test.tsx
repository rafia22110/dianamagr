import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { insforge } from '@/lib/insforge';

vi.mock('@/lib/insforge', () => {
  const maybeSingle = vi.fn();
  const order = vi.fn().mockReturnThis();
  const limit = vi.fn().mockReturnThis();
  const eq = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  const from = vi.fn().mockReturnValue({ select, eq, limit, maybeSingle, order });

  return {
    insforge: {
      database: { from },
    },
  };
});

vi.mock('@/components/GallerySection', () => ({ default: () => <div data-testid="gallery-section" /> }));
vi.mock('@/components/PodcastsSection', () => ({
  default: () => <div data-testid="podcasts-section" />,
  fetchLinks: vi.fn().mockResolvedValue([])
}));
vi.mock('@/components/NewsletterSection', () => ({ default: () => <div data-testid="newsletter-section" /> }));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles InsForge connection errors gracefully and logs a warning', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockError = new Error('Database connection failed');

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockRejectedValue(mockError)
    };

    (insforge.database.from as any).mockReturnValue(mockChain);

    // Call HomePage which is an async Server Component
    const result = await HomePage();

    // Render the resulting JSX
    const { container } = render(result);

    // Assert that console.warn was called
    expect(consoleWarnSpy).toHaveBeenCalledWith("InsForge fetch warning:", mockError);

    // Check that it falls back to the default hero image correctly
    // The default heroBg is "https://img.mako.co.il/2016/11/13/dayana.png"
    const heroSection = container.querySelector('#home > div');
    expect(heroSection).not.toBeNull();
    expect(heroSection?.getAttribute('style')).toContain("https://img.mako.co.il/2016/11/13/dayana.png");
  });
});
