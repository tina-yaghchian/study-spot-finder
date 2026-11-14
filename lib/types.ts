export type StudySpot = {
  id: string;
  name: string;
  description: string | null;
  building: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type Review = {
  id: string;
  study_spot_id: string;
  user_id: string | null;
  noise_rating: number;
  wifi_rating: number;
  outlet_rating: number;
  crowd_rating: number;
  comment: string | null;
  created_at: string;
};

export type Photo = {
  id: string;
  study_spot_id: string;
  user_id: string | null;
  image_url: string;
  created_at: string;
};
