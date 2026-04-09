import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PodcastsSection, { fetchLinks, LinkRecord } from './PodcastsSection';
import { insforge } from '@/lib/insforge';

vi.mock('@/lib/insforge', () => {
  const order = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  const from = vi.fn().mockReturnValue({ select, order });

  return {
    insforge: {
      database: { from },
    },
  };
});

describe('fetchLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns data from database on success', async () => {
    const mockData = [{ id: '1', title: 'Test Link', url: 'https://test.com', display_order: 1 }];
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    (insforge.database.from as any).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    const result = await fetchLinks();
    expect(result).toEqual(mockData);
    expect(insforge.database.from).toHaveBeenCalledWith('links');
  });

  it('returns FALLBACK_LINKS when database returns error', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
    (insforge.database.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: mockOrder,
    });

    const result = await fetchLinks();
    expect(result.length).toBe(10); // There are 10 fallback links
    expect(result[0].title).toBe('ראיון מקיף במאקו - ערוץ 12');
  });

  it('returns FALLBACK_LINKS when database returns no data', async () => {
     const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    (insforge.database.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: mockOrder,
    });

    const result = await fetchLinks();
    expect(result.length).toBe(10);
  });

  it('returns FALLBACK_LINKS when database throws an exception', async () => {
    const mockOrder = vi.fn().mockRejectedValue(new Error('Network error'));
    (insforge.database.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: mockOrder,
    });

    const result = await fetchLinks();
    expect(result.length).toBe(10);
  });
});

describe('PodcastsSection Component', () => {
  const mockLinks: LinkRecord[] = [
    {
      id: '1',
      title: 'Link Title 1',
      description: 'Link Description 1',
      url: 'https://link1.com',
      icon: '/icons/youtube.svg',
      type: 'YouTube',
      display_order: 1,
    },
    {
      id: '2',
      title: 'Link Title 2',
      description: 'Link Description 2',
      url: 'https://link2.com',
      type: 'Article',
      display_order: 2,
    },
  ];

  it('renders correctly with given links', () => {
    render(<PodcastsSection links={mockLinks} />);

    expect(screen.getByText('Link Title 1')).toBeDefined();
    expect(screen.getByText('Link Description 1')).toBeDefined();
    expect(screen.getByText('Link Title 2')).toBeDefined();
    expect(screen.getByText('Link Description 2')).toBeDefined();

    const links = screen.getAllByRole('link', { name: /צפו עכשיו/i });
    expect(links[0].getAttribute('href')).toBe('https://link1.com');
    expect(links[1].getAttribute('href')).toBe('https://link2.com');
  });

  it('renders correct button text for Spotify links', () => {
    const spotifyLink: LinkRecord[] = [
      {
        id: '3',
        title: 'Spotify Podcast',
        description: 'Listen on Spotify',
        url: 'https://spotify.com/podcast',
        type: 'Spotify',
        display_order: 3,
      },
    ];

    render(<PodcastsSection links={spotifyLink} />);
    expect(screen.getByText('האזינו ב-Spotify')).toBeDefined();
  });
});
