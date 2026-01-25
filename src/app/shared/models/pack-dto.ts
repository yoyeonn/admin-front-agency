import { DestinationDTO } from './destination-dto';
import { HotelDTO } from './hotel-dto';

export type PackActivityDTO = {
  day: number;
  activity: string;
};

export type PackFaqDTO = {
  question: string;
  answer: string;
  open?: boolean;
};

export type PackReviewDTO = {
  name: string;
  stars: number;
  comment: string;
};

export type PackNearbyDTO = {
  name: string;
  distance: string;
};

export type PackDTO = {
  id?: number;

  name: string;
  country: string;
  price: number;
  days: number;
  rating?: number;
  location?: string;

  description?: string;
  about?: string;

  images?: string[];

  // read side (coming from backend)
  hotel?: HotelDTO;
  destination?: DestinationDTO;

  activities?: PackActivityDTO[];
  faq?: PackFaqDTO[];
  reviews?: PackReviewDTO[];
  nearby?: PackNearbyDTO[];
};

// payload for create/update (recommended)
export type PackUpsertPayload = {
  name: string;
  country: string;
  price: number;
  days: number;
  rating?: number;
  location?: string;
  description?: string;
  about?: string;
  images?: string[];

  hotelId: number;
  destinationId: number;

  activities?: PackActivityDTO[];
  faq?: PackFaqDTO[];
  nearby?: PackNearbyDTO[];
  reviews?: PackReviewDTO[];
};
