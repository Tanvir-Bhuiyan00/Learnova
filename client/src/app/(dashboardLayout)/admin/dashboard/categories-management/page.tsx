"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { deleteCategory, getCategories } from "@/services/category.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CategoriesManagementPage = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (res) => {
      if (res.success) { toast.success("Category deleted"); queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); }
      else { toast.error(res.message); }
    },
  });

  return (
    <AdminListPage
      title="Categories Management"
      queryKey={["admin-categories"]}
      queryFn={(page) => getCategories(`page=${page}&limit=10`)}
      onDelete={(id) => deleteMutation.mutate(id)}
      columns={[
        { key: "title", label: "Title", render: (c: any) => c.title },
        { key: "description", label: "Description", render: (c: any) => c.description || "—" },
      ]}
    />
  );
};

export default CategoriesManagementPage;
