interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className = '' }: IconProps) {
  // Placeholder - integrate with actual icon library or SVG imports
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Placeholder icon - replace with actual icon paths */}
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  );
}
