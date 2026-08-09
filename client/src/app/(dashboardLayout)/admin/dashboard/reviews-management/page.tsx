"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { getReviews } from "@/services/review.services";
import { Star } from "lucide-react";

const ReviewsManagementPage = () => (
  <AdminListPage
    title="Reviews Management"
    queryKey={["admin-reviews"]}
    queryFn={(page) => getReviews(`page=${page}&limit=10`)}
    columns={[
      { key: "rating", label: "Rating", render: (r: any) => (
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          {r.rating}/5
        </div>
      )},
      { key: "comment", label: "Comment", render: (r: any) => r.comment?.slice(0, 80) || "—" },
      { key: "createdAt", label: "Date", render: (r: any) => new Date(r.createdAt).toLocaleDateString() },
    ]}
  />
);

export default ReviewsManagementPage;
