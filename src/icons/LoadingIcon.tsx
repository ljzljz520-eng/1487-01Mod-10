import { Component } from 'solid-js';
import { IconProps } from './Icon';

const LoadingIcon: Component<IconProps> & { displayName?: string } = (props) => {
  const size = props.size || 16;
  const color = props.color || 'currentColor';

  return (
    <svg
      class={props.class}
      style={{
        ...props.style,
        animation: 'swc-spin 1s linear infinite',
      }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        stroke-width="3"
        stroke-opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        stroke-width="3"
        stroke-linecap="round"
      />
      <style>
        {'@keyframes swc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}
      </style>
    </svg>
  );
};

LoadingIcon.displayName = 'LoadingIcon';

export default LoadingIcon;
