import { Component, JSX } from 'solid-js';

export interface IconProps {
  size?: number | string;
  color?: string;
  class?: string;
  style?: JSX.CSSProperties;
}

const createIcon = (pathD: string, displayName: string): Component<IconProps> => {
  const Icon: Component<IconProps> & { displayName?: string } = (props) => {
    const size = props.size || 16;
    const color = props.color || 'currentColor';

    return (
      <svg
        class={props.class}
        style={props.style}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d={pathD} />
      </svg>
    );
  };

  Icon.displayName = displayName;
  return Icon as Component<IconProps>;
};

export default createIcon;
