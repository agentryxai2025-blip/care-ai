interface CareAffinityIconProps {
  className?: string;
  size?: number;
}

export function CareAffinityIcon({ className, size }: CareAffinityIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="CareAffinity Engine"
    >
      <defs>
        <linearGradient id="ca-heart-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Heart body */}
      <path
        d="M12 20.35C11.67 20.13 3.5 14.85 3.5 8.75C3.5 6.15 5.61 4 8.25 4C9.96 4 11.38 4.9 12 6.22C12.62 4.9 14.04 4 15.75 4C18.39 4 20.5 6.15 20.5 8.75C20.5 14.85 12.33 20.13 12 20.35Z"
        fill="url(#ca-heart-grad)"
      />

      {/* Participant node — top left lobe */}
      <circle cx="9" cy="9.2" r="1.4" fill="white" fillOpacity="0.85" />

      {/* Provider node — top right lobe */}
      <circle cx="15" cy="9.2" r="1.4" fill="white" fillOpacity="0.85" />

      {/* Affinity node — center convergence (the match point) */}
      <circle cx="12" cy="13.4" r="1.6" fill="white" fillOpacity="0.97" />

      {/* Connector: participant → affinity */}
      <line x1="9" y1="9.2" x2="12" y2="13.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.55" strokeLinecap="round" />

      {/* Connector: provider → affinity */}
      <line x1="15" y1="9.2" x2="12" y2="13.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.55" strokeLinecap="round" />

      {/* Connector: participant ↔ provider */}
      <line x1="9" y1="9.2" x2="15" y2="9.2" stroke="white" strokeWidth="0.7" strokeOpacity="0.3" strokeLinecap="round" />

      {/* Tiny spark at affinity center node — 4-point star */}
      <path
        d="M12 12.4 L12.35 13.4 L12 14.4 L11.65 13.4 Z"
        fill="url(#ca-heart-grad)"
        fillOpacity="0.6"
      />
    </svg>
  );
}
