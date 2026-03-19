import { describe, it, expect } from 'vitest';
import { convertToCSV } from './csv-utils';

describe('convertToCSV', () => {
  it('should convert simple rows', () => {
    const rows = [
      ['Name', 'Email'],
      ['Diana', 'diana@example.com'],
    ];
    // CRLF line endings
    expect(convertToCSV(rows)).toBe('Name,Email\r\nDiana,diana@example.com');
  });

  it('should escape fields with commas, quotes, and newlines', () => {
    const rows = [
      ['Name', 'Comment'],
      ['Diana', 'Hello, World'],
      ['John', 'He said "Hello"'],
      ['Jane', 'Line 1\nLine 2'],
    ];
    const expected = 'Name,Comment\r\nDiana,"Hello, World"\r\nJohn,"He said ""Hello"""\r\nJane,"Line 1\nLine 2"';
    expect(convertToCSV(rows)).toBe(expected);
  });

  it('should protect against CSV Injection (Formula Injection)', () => {
    const rows = [
      ['Name', 'Formula'],
      ['Evil', '=SUM(1,2)'],
      ['Math', '+10'],
      ['Minus', '-5'],
      ['At', '@info'],
    ];
    // Note: Our implementation escapes the field with quotes if it contains a comma after prepending the quote
    // In this case, '=SUM(1,2)' contains a comma, so it becomes "'=SUM(1,2)" (quoted)
    const expected = "Name,Formula\r\nEvil,\"'=SUM(1,2)\"\r\nMath,'+10\r\nMinus,'-5\r\nAt,'@info";
    expect(convertToCSV(rows)).toBe(expected);
  });

  it('should handle special cases combined with escaping', () => {
    const rows = [
      ['Formula with comma', '=SUM(1,2),3'],
    ];
    // Formula protection happens first: '=SUM(1,2),3' -> ''=SUM(1,2),3'
    // Then escaping because of comma: ''=SUM(1,2),3' -> '"'=SUM(1,2),3"'
    const expected = 'Formula with comma,"\'=SUM(1,2),3"';
    expect(convertToCSV(rows)).toBe(expected);
  });

  it('should handle empty or undefined fields', () => {
    const rows = [
      ['Name', 'Phone'],
      ['Diana', ''],
      // @ts-ignore
      ['John', undefined],
    ];
    expect(convertToCSV(rows)).toBe('Name,Phone\r\nDiana,\r\nJohn,');
  });
});
