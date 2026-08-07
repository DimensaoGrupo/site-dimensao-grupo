type IconProps = {
  className?: string;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ReceptionIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...base} aria-hidden="true">
      <path d="M6 30V16l14-8 14 8v14" />
      <path d="M6 30h28" />
      <rect x="14" y="20" width="12" height="10" />
      <path d="M18 30v-5h4v5" />
    </svg>
  );
}

export function CctvIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...base} aria-hidden="true">
      <rect x="7" y="14" width="18" height="12" rx="2" />
      <circle cx="16" cy="20" r="4" />
      <path d="M25 17l8-4v14l-8-4" />
      <path d="M12 30l-2 4M20 30l2 4" />
    </svg>
  );
}

export function AccessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...base} aria-hidden="true">
      <rect x="8" y="7" width="24" height="26" rx="2" />
      <circle cx="20" cy="16" r="4" />
      <path d="M13 27c1.5-4 5-6 7-6s5.5 2 7 6" />
      <path d="M8 20h-3M35 20h-3" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...base} aria-hidden="true">
      <circle cx="20" cy="20" r="14" />
      <path d="M20 12v8l6 4" />
    </svg>
  );
}

export function GardenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...base} aria-hidden="true">
      <path d="M20 33V19" />
      <path d="M20 19c0-6-5-10-11-10 0 6 4 10 11 10Z" />
      <path d="M20 23c0-5 5-8 10-8 0 5-4 8-10 8Z" />
      <path d="M13 33h14" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...base} aria-hidden="true">
      <path d="M20 6l12 5v9c0 8-5.5 13-12 15-6.5-2-12-7-12-15v-9l12-5Z" />
      <path d="M15 19.5l3.5 3.5L26 15" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M5 4h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2C10.5 21 3 13.5 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M12 22s7-7.4 7-12.5A7 7 0 0 0 5 9.5C5 14.6 12 22 12 22Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 6.5l8 6 8-6" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.6V3.6C15.9 3.5 15 3.4 13.9 3.4c-2.4 0-4 1.5-4 4.2v2.3H7.2V13H10v8h3.5Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}
