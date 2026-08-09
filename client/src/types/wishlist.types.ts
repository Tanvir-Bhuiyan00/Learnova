export interface IWishlistItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  courseId: string;
}

export interface IAddWishlistItemPayload {
  courseId: string;
}
