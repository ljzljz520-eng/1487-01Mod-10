import { describe, it, expect, vi } from 'vitest';
import { render } from 'solid-js/web';
import Button from '../Button';

describe('Button Component', () => {
  it('should render default button with primary variant and medium size', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <Button>Default Button</Button>, container);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Default Button');
    expect(button?.classList.contains('swc-button')).toBe(true);
    expect(button?.classList.contains('swc-button--primary')).toBe(true);
    expect(button?.classList.contains('swc-button--medium')).toBe(true);

    document.body.removeChild(container);
  });

  it('should render button with different variants', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </>
      ),
      container
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);

    expect(buttons[0].textContent).toBe('Primary');
    expect(buttons[0].classList.contains('swc-button--primary')).toBe(true);

    expect(buttons[1].textContent).toBe('Secondary');
    expect(buttons[1].classList.contains('swc-button--secondary')).toBe(true);

    expect(buttons[2].textContent).toBe('Outline');
    expect(buttons[2].classList.contains('swc-button--outline')).toBe(true);

    expect(buttons[3].textContent).toBe('Ghost');
    expect(buttons[3].classList.contains('swc-button--ghost')).toBe(true);

    document.body.removeChild(container);
  });

  it('should render button with different sizes', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </>
      ),
      container
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);

    expect(buttons[0].textContent).toBe('Small');
    expect(buttons[0].classList.contains('swc-button--small')).toBe(true);

    expect(buttons[1].textContent).toBe('Medium');
    expect(buttons[1].classList.contains('swc-button--medium')).toBe(true);

    expect(buttons[2].textContent).toBe('Large');
    expect(buttons[2].classList.contains('swc-button--large')).toBe(true);

    document.body.removeChild(container);
  });

  it('should render disabled button with correct styles', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <Button disabled>Disabled Button</Button>, container);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Disabled Button');
    expect(button?.disabled).toBe(true);

    document.body.removeChild(container);
  });

  it('should handle click events', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Click Me</Button>, container);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    button?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);

    document.body.removeChild(container);
  });

  it('should not trigger click when disabled', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handleClick = vi.fn();
    render(
      () => (
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      ),
      container
    );

    const button = container.querySelector('button');
    button?.click();
    expect(handleClick).not.toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('should render loading state', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <Button loading>Loading</Button>, container);

    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.querySelector('svg')).toBeTruthy();

    document.body.removeChild(container);
  });

  it('should not trigger click when loading', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handleClick = vi.fn();
    render(
      () => (
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      ),
      container
    );

    const button = container.querySelector('button');
    button?.click();
    expect(handleClick).not.toHaveBeenCalled();

    document.body.removeChild(container);
  });
});
