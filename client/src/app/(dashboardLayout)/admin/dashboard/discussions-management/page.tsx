"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { getDiscussions } from "@/services/discussion.services";
import { Badge } from "@/components/ui/badge";

const DiscussionsManagementPage = () => (
  <AdminListPage
    title="Discussions Management"
    queryKey={["admin-discussions"]}
    queryFn={() => getDiscussions()}
    columns={[
      { key: "title", label: "Title", render: (d: any) => d.title },
      { key: "resolved", label: "Status", render: (d: any) => d.isResolved ? <Badge>Resolved</Badge> : <Badge variant="secondary">Open</Badge> },
      { key: "pinned", label: "Pinned", render: (d: any) => d.isPinned ? "Yes" : "No" },
      { key: "createdAt", label: "Created", render: (d: any) => new Date(d.createdAt).toLocaleDateString() },
    ]}
  />
);

export default DiscussionsManagementPage;
