"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { getAllPayments } from "@/services/payment.services";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  SUCCEEDED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

const PaymentsManagementPage = () => (
  <AdminListPage
    title="Payments Management"
    queryKey={["admin-payments"]}
    queryFn={(page) => getAllPayments(`page=${page}&limit=10`)}
    columns={[
      { key: "id", label: "ID", render: (p: any) => p.id.slice(0, 8) + "..." },
      { key: "amount", label: "Amount", render: (p: any) => `${p.currency} ${p.amount.toFixed(2)}` },
      { key: "status", label: "Status", render: (p: any) => <Badge className={statusColor[p.status]}>{p.status}</Badge> },
      { key: "createdAt", label: "Date", render: (p: any) => new Date(p.createdAt).toLocaleDateString() },
    ]}
  />
);

export default PaymentsManagementPage;
