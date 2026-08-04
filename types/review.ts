export interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  media: Array<{ original_url: string }>;
}

export interface ReviewsResponse {
  data: {
    message: string;
    review_count: number;
    average_rating: number;
    star_rating_counts: number[];
    reviews: {
      data: Review[];
    };
  };
}