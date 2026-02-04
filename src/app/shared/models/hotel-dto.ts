export interface HotelDTO {
  id: number;
  name: string;
  description?: string;
  
  map?: string;
  city?: string;
  country?: string;

  days?: string;
  stars?: string;
  about?: string;

  cancellationPolicy?: string;
  availableDates?: string;
  bestTimeToVisit?: string;

  travelTips?: string[];
  suitedFor?: string[];
  includes?: string[];
  excludes?: string[];

  images?: string[];
  highlights?: string[];

  rooms?: {
    id: number;
    name: string;
    image?: string;
    description?: string;
    capacity: number;
    price: number;
  }[];

  nearby?: {
    name: string;
    distance: string;
  }[];

  faq?: {
    question: string;
    answer: string;
    open: boolean;
  }[];

  programme?: {
    day: number;
    activity: string;
  }[];
}
