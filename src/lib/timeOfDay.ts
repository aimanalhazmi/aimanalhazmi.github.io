export type Phase = 'morning' | 'afternoon' | 'evening' | 'night';

export type Palette = {
  /** Galaxy core color (inner particles). */
  inside: string;
  /** Galaxy edge color (outer particles). */
  outside: string;
  /** Nebula tint A. */
  nebulaA: string;
  /** Nebula tint B. */
  nebulaB: string;
  /** Scene background color. */
  bg: string;
  /** Star tint multiplier for the dot trails — kept white most phases. */
  trail: string;
};

/** Bucket the local hour into a phase. */
export function phaseForHour(hour: number): Phase {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function greetingFor(phase: Phase): string {
  switch (phase) {
    case 'morning':
      return 'Good morning.';
    case 'afternoon':
      return 'Good afternoon.';
    case 'evening':
      return 'Good evening.';
    case 'night':
      return 'Good night.';
  }
}

const palettes: Record<Phase, Palette> = {
  morning: {
    inside: '#f97316',     // amber sunrise
    outside: '#fbbf24',    // gold
    nebulaA: '#fb923c',
    nebulaB: '#f472b6',
    bg: '#1a0a14',
    trail: '#fff5d6',
  },
  afternoon: {
    inside: '#60a5fa',     // sky blue
    outside: '#22d3ee',    // cyan
    nebulaA: '#3b82f6',
    nebulaB: '#22d3ee',
    bg: '#06121f',
    trail: '#ffffff',
  },
  evening: {
    inside: '#ec4899',     // magenta
    outside: '#f97316',    // sunset orange
    nebulaA: '#db2777',
    nebulaB: '#f59e0b',
    bg: '#15081a',
    trail: '#ffd8a8',
  },
  night: {
    inside: '#7c5cff',     // deep purple (default)
    outside: '#22d3ee',    // cyan
    nebulaA: '#7c5cff',
    nebulaB: '#22d3ee',
    bg: '#04040a',
    trail: '#ffffff',
  },
};

export function paletteFor(phase: Phase): Palette {
  return palettes[phase];
}

/** Convenience: read the current phase from the visitor's local time. */
export function currentPhase(date = new Date()): Phase {
  return phaseForHour(date.getHours());
}
