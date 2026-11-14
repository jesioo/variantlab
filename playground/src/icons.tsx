import type { SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox'>;

function Icon({ path, ...props }: IconProps & { readonly path: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={path} />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return <Icon path="M3.5 8.5l3 3 6-7" {...props} />;
}

export function MinusIcon(props: IconProps) {
  return <Icon path="M4 8h8" {...props} />;
}

export function PlusIcon(props: IconProps) {
  return <Icon path="M8 4v8M4 8h8" {...props} />;
}
