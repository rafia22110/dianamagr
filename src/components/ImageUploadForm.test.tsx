import { test, mock, describe, beforeEach, afterEach } from 'node:test';
import assert from 'assert';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';

// Mock the insforge import object by overwriting its properties directly
import { insforge } from '@/lib/insforge';

let uploadMock: any;
let insertMock: any;

describe('ImageUploadForm', async () => {
  let ImageUploadForm: any;

  beforeEach(async () => {
    uploadMock = mock.fn(async () => ({ data: { url: 'mock-url', key: 'mock-key' }, error: null }));
    insertMock = mock.fn(async () => ({ error: null }));

    (insforge as any).storage = {
        from: () => ({ upload: uploadMock })
    };
    (insforge as any).database = {
        from: () => ({ insert: insertMock })
    };

    const mod = await import('./ImageUploadForm');
    ImageUploadForm = mod.default;
  });

  afterEach(() => {
    cleanup();
    mock.restoreAll();
  });

  test('Rendering components correctly', async () => {
    const { getByText } = render(<ImageUploadForm onSuccess={() => {}} />);
    assert.ok(getByText('בחרי תמונה', { selector: 'label' }));
    assert.ok(getByText('קטגוריה', { selector: 'label' }));
    assert.ok(getByText('תיאור (Alt Text)', { selector: 'label' }));
    assert.ok(getByText('תגיות', { selector: 'label' }));
    assert.ok(getByText('העלה תמונה', { selector: 'button' }));
  });

  test('Validation error - no file', async () => {
    const { getByText, container } = render(<ImageUploadForm onSuccess={() => {}} />);
    fireEvent.click(getByText('העלה תמונה', { selector: 'button' }));
    await waitFor(() => {
      const errorDiv = container.querySelector('.bg-red-100');
      assert.ok(errorDiv);
      assert.strictEqual(errorDiv?.textContent, 'בחרי תמונה');
    });
  });

  test('Validation error - invalid file type', async () => {
    const { getByText, container } = render(<ImageUploadForm onSuccess={() => {}} />);

    // Create a dummy PDF file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(getByText('העלה תמונה', { selector: 'button' }));
    await waitFor(() => {
      const errorDiv = container.querySelector('.bg-red-100');
      assert.ok(errorDiv);
      assert.strictEqual(errorDiv?.textContent, 'פורמט לא נתמך. העלי JPG, PNG, GIF או WEBP');
    });
  });

  test('Upload error', async () => {
    uploadMock.mock.mockImplementation(async () => ({ data: null, error: { message: 'Upload Failed' } }));
    const { getByText, container } = render(<ImageUploadForm onSuccess={() => {}} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(getByText('העלה תמונה', { selector: 'button' }));
    await waitFor(() => {
      const errorDiv = container.querySelector('.bg-red-100');
      assert.ok(errorDiv);
      assert.strictEqual(errorDiv?.textContent, 'Upload Failed');
    });
  });

  test('Database error', async () => {
    insertMock.mock.mockImplementation(async () => ({ error: { message: 'Database Error' } }));
    const { getByText, container } = render(<ImageUploadForm onSuccess={() => {}} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(getByText('העלה תמונה', { selector: 'button' }));
    await waitFor(() => {
      const errorDiv = container.querySelector('.bg-red-100');
      assert.ok(errorDiv);
      assert.strictEqual(errorDiv?.textContent, 'Database Error');
    });
  });

  test('Successful upload', async () => {
    let successCalled = false;
    const { getByText, container } = render(<ImageUploadForm onSuccess={() => { successCalled = true; }} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(getByText('העלה תמונה', { selector: 'button' }));
    await waitFor(() => {
      assert.strictEqual(successCalled, true);
    });

    assert.strictEqual(uploadMock.mock.callCount(), 1);
    assert.strictEqual(insertMock.mock.callCount(), 1);
  });
});
