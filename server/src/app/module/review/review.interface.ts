export interface ICreateReviewPayload {
  courseId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  rating: number;
  comment: string;
}
