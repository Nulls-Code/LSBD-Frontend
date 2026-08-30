interface IconProps {
  className?: string;
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.146.565 4.195 1.636 6.002L.15 23.94l6.059-1.589a12.001 12.001 0 0 0 5.822 1.502c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm5.952 17.391c-.244.686-1.42 1.306-1.968 1.365-.515.055-1.18-.08-3.32-1.026-2.614-1.155-4.296-3.83-4.426-4.004-.131-.174-1.054-1.403-1.054-2.678 0-1.275.663-1.905.897-2.142.234-.236.509-.294.678-.294.17 0 .34.003.486.01.152.007.355-.06.551.41.205.493.696 1.701.758 1.826.061.124.102.27.02.434-.082.164-.124.267-.245.411-.12.144-.256.32-.366.444-.121.134-.247.281-.106.525.141.243.627 1.036 1.344 1.678.924.827 1.7 1.077 1.942 1.196.242.119.385.099.531-.067.146-.167.627-.732.795-.984.168-.252.336-.21.558-.126.222.083 1.402.661 1.642.781.24.12.4.18.458.281.06.1.06.581-.184 1.267z"/>
    </svg>
  );
}

/** Map of icon names to components for data-driven rendering */
export const SOCIAL_ICON_MAP = {
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
} as const;
