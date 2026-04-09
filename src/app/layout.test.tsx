import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

describe('RootLayout Metadata', () => {
  it('has the correct title', () => {
    expect(metadata.title).toBe('דיאנה רחמני - מטבח פרסי, תקווה ובריחה מטהרן');
  });

  it('has the correct description', () => {
    expect(metadata.description).toBe("כוכבת מאסטר שף, מחברת ספר 'הבריחה מטהרן', ומובילת המטבח הפרסי בישראל");
  });
});

describe('RootLayout Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div data-testid="test-child">Test Child Content</div>
      </RootLayout>
    );
    expect(getByText('Test Child Content')).toBeDefined();
  });

  it('has correct lang and dir attributes on html-like structure', () => {
    // We render the component. Since it's a layout including html/body,
    // jsdom might struggle if we just look at the container.
    // However, we can check the rendered output as a string if needed,
    // or just check if the tags are present in the DOM.
    const { container } = render(
      <RootLayout>
        <div>Children</div>
      </RootLayout>
    );

    // In many testing environments, the layout component might be rendered
    // as a regular component where <html> and <body> tags are just elements.
    // If querySelector('html') fails on container, it might be because
    // it was lifted or stripped.

    // Let's try to find them in the document if not in container
    const htmlTag = container.querySelector('html') || document.querySelector('html');
    expect(htmlTag).not.toBeNull();
    expect(htmlTag?.getAttribute('lang')).toBe('he');
    expect(htmlTag?.getAttribute('dir')).toBe('rtl');
  });

  it('has correct classes on body-like structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Children</div>
      </RootLayout>
    );

    const bodyTag = container.querySelector('body') || document.querySelector('body');
    expect(bodyTag).not.toBeNull();
    expect(bodyTag?.className).toContain('antialiased');
    expect(bodyTag?.className).toContain('bg-[#f9f7f4]');
    expect(bodyTag?.className).toContain('text-[#333]');
    expect(bodyTag?.className).toContain('min-h-screen');
  });
});
