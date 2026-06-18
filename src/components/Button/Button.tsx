import { Component, JSX, splitProps } from 'solid-js';
import './style.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
  children?: JSX.Element;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'size',
    'disabled',
    'loading',
    'icon',
    'iconPosition',
    'children',
    'onClick',
    'type',
  ]);

  const variant = local.variant || 'primary';
  const size = local.size || 'medium';
  const disabled = local.disabled || false;
  const loading = local.loading || false;
  const iconPosition = local.iconPosition || 'left';

  const classes = [
    'swc-button',
    `swc-button--${variant}`,
    `swc-button--${size}`,
    !local.children && local.icon ? 'swc-button--icon-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      class={classes}
      disabled={isDisabled}
      onClick={!isDisabled ? local.onClick : undefined}
      type={local.type || 'button'}
    >
      {loading ? (
        <span class="swc-button__icon">
          <svg
            width={size === 'small' ? 14 : size === 'large' ? 20 : 16}
            height={size === 'small' ? 14 : size === 'large' ? 20 : 16}
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: 'swc-spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
        </span>
      ) : iconPosition === 'left' && local.icon ? (
        <span class="swc-button__icon">{local.icon}</span>
      ) : null}
      {local.children}
      {!loading && iconPosition === 'right' && local.icon ? (
        <span class="swc-button__icon">{local.icon}</span>
      ) : null}
    </button>
  );
};

export default Button;
