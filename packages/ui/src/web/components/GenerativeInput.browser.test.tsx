import { createRef, render } from 'preact';
import { expect, it } from 'vitest';
import { GenerativeInput } from './GenerativeInput';

it('removes the AI prompt limit when returning to provider search', () => {
  const root = document.createElement('div');
  const inputRef = createRef<HTMLInputElement>();
  const props = {
    enabled: true,
    disabled: false,
    inputRef,
    value: 'rainy day',
    placeholder: '',
    onChange: () => {},
    onToggle: () => {},
    onSubmit: () => {},
  };

  render(<GenerativeInput {...props} active maxLength={300} />, root);
  expect(inputRef.current?.maxLength).toBe(300);

  render(<GenerativeInput {...props} active={false} />, root);
  expect(inputRef.current?.hasAttribute('maxlength')).toBe(false);
  expect(inputRef.current?.value).toBe('rainy day');
  render(null, root);
});
