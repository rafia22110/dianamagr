import { describe, it, expect } from 'vitest';
import { sanitizeCSVField, convertToCSV } from './csv-utils';

describe('csv-utils', () => {
  describe('sanitizeCSVField', () => {
    it('returns empty string for null, undefined, or empty string', () => {
      expect(sanitizeCSVField(null)).toBe("");
      expect(sanitizeCSVField(undefined)).toBe("");
      expect(sanitizeCSVField("")).toBe("");
    });

    it('passes through normal strings', () => {
      expect(sanitizeCSVField('Normal String')).toBe('Normal String');
    });

    it('handles numbers', () => {
      expect(sanitizeCSVField(123.45)).toBe('123.45');
    });

    it('escapes double quotes', () => {
      expect(sanitizeCSVField('String with "quotes"')).toBe('"String with ""quotes"""');
    });

    it('wraps strings with commas', () => {
      expect(sanitizeCSVField('String, with comma')).toBe('"String, with comma"');
    });

    it('wraps strings with newlines', () => {
      expect(sanitizeCSVField('String with\nnewline')).toBe('"String with\nnewline"');
    });

    it('prepends single quote to formula characters', () => {
      expect(sanitizeCSVField('=SUM(1,2)')).toBe('"' + "'=SUM(1,2)" + '"');
      expect(sanitizeCSVField('+123')).toBe('"' + "'+123" + '"');
      expect(sanitizeCSVField('-456')).toBe('"' + "'-456" + '"');
      expect(sanitizeCSVField('@admin')).toBe('"' + "'@admin" + '"');
    });

    it('handles both formula characters and CSV special characters', () => {
      expect(sanitizeCSVField('=SUM(1, 2)')).toBe('"' + "'=SUM(1, 2)" + '"');

      // Input: '="Formula with ""quotes"""'
      // 1. Formula: '="Formula with ""quotes"""
      // 2. Escape: '=""Formula with """"quotes""""""
      // 3. Wrap: "'=""Formula with """"quotes"""""""
      const expected = '"' + "'=\"\"Formula with \"\"\"\"quotes\"\"\"\"\"\"" + '"';
      expect(sanitizeCSVField('="Formula with ""quotes"""')).toBe(expected);
    });
  });

  describe('convertToCSV', () => {
    it('converts rows to a CSV string using CRLF', () => {
      const rows = [
        ['Name', 'Email'],
        ['John Doe', 'john@example.com'],
        ['=Evil', 'commas, here']
      ];
      const csv = convertToCSV(rows);

      const expected = [
        'Name,Email',
        'John Doe,john@example.com',
        '"' + "'=Evil" + '","commas, here"'
      ].join('\r\n');

      expect(csv).toBe(expected);
    });
  });
});
