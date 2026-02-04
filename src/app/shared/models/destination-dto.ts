export type DestinationActivityDTO = {
  day: number;
  activity: string;
};

export type DestinationFaqDTO = {
  question: string;
  answer: string;
  open?: boolean;
};

export type DestinationReviewDTO = {
  name: string;
  stars: number;
  comment: string;
};

export type DestinationNearbyDTO = {
  name: string;
  distance: string;
};

export type DestinationDTO = {
  id?: number;

  name: string;
  country: string;
  price: number;
  days: number;

  location?: string;
  map?: string;
  title?: string;

  description?: string;
  about?: string;

  availableFrom?: string;
  availableTo?: string;

  images?: string[];

  activities?: DestinationActivityDTO[];
  faq?: DestinationFaqDTO[];
  reviews?: DestinationReviewDTO[];
  nearby?: DestinationNearbyDTO[];
};
