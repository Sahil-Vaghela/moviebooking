export type FormatType = '2D' | '3D' | 'IMAX 2D' | 'IMAX 3D' | '4DX' | 'Dolby Atmos';
export type CertificationType = 'U' | 'UA' | 'UA 13+' | 'UA 16+' | 'A';
export type ReleaseStatus = 'NOW_SHOWING' | 'COMING_SOON';

export interface City {
  id: string;
  name: string;
  state: string;
  code: string;
  region: 'West' | 'North' | 'South' | 'East';
  tagline: string;
  theatreCountLabel: string;
  featured: boolean;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CastMember {
  name: string;
  role: string;
  character?: string;
}

export interface Movie {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  releaseDate: string;
  durationMins: number;
  certification: CertificationType;
  rating: number;
  votesCount: number;
  languages: string[];
  formats: FormatType[];
  genreIds: string[];
  cityIds: string[];
  status: ReleaseStatus;
  posterUrl: string;
  backdropUrl: string;
  accentTone: string;
  director: string;
  cast: CastMember[];
  featured: boolean;
}

export interface Banner {
  id: string;
  movieId: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  imageUrl: string;
  cityIds: string[];
}

export interface Theatre {
  id: string;
  cityId: string;
  name: string;
  chain: string;
  locality: string;
  address: string;
  amenities: string[];
  cancellationAllowed: boolean;
  mTicketSupported: boolean;
  foodAndBeverage: boolean;
}

export interface SeatTierConfig {
  tier: 'PLATINUM' | 'GOLD' | 'SILVER';
  label: string;
  rows: string[];
  seatsPerRow: number;
  aisleAfterColumns: number[];
  basePriceInr: number;
}

export interface Screen {
  id: string;
  theatreId: string;
  name: string;
  soundSystem: string;
  projection: string;
  supportedFormats: FormatType[];
  totalSeats: number;
  tiers: SeatTierConfig[];
}

export interface Show {
  id: string;
  movieId: string;
  cityId: string;
  theatreId: string;
  screenId: string;
  dateOffsetDays: number; // 0 = Today, 1 = Tomorrow, 2 = Day+2, 3 = Day+3
  startTime: string; // 24h HH:mm e.g. "18:30"
  language: string;
  format: FormatType;
  priceMultiplier: number;
  fillingStatus: 'AVAILABLE' | 'FAST_FILLING' | 'ALMOST_FULL';
  sampleOccupiedSeats: string[]; // Visual catalogue preview only; live occupancy comes from Firestore showSeats
}
