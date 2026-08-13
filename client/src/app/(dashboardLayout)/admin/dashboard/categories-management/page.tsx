"use client";

import { CrudAdminPage } from "@/components/shared/CrudAdminPage";
import { Badge } from "@/components/ui/badge";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/services/category.services";
import { ICategory } from "@/types/category.types";

const CategoriesManagementPage = () => {
  return (
    <CrudAdminPage<ICategory>
      title="Categories Management"
      description="Create, edit, and organize the categories shown across the catalog."
      queryKey={["admin-categories"]}
      queryFn={async (page) => {
        const res = await getCategories(`page=${page}&limit=10`);
        return { data: res.data, meta: res.meta };
      }}
      columns={[
        { key: "title", label: "Title", render: (c) => c.title },
        { key: "description", label: "Description", render: (c) => c.description || "—" },
        {
          key: "icon",
          label: "Icon",
          render: (c) => (c.icon ? <Badge variant="secondary">Set</Badge> : <Badge variant="outline">None</Badge>),
        },
      ]}
      fields={[
        { name: "title", label: "Title", placeholder: "e.g. Web Development", required: true },
        { name: "description", label: "Description", type: "textarea", placeholder: "Short description of this category" },
      ]}
      createDefaults={() => ({ title: "", description: "" })}
      toForm={(c) => ({ title: c.title, description: c.description ?? "" })}
      createMutation={async (values) => {
        const res = await createCategory({ title: values.title, description: values.description || undefined });
        return { success: res.success, message: res.message };
      }}
      updateMutation={async (id, values) => {
        const res = await updateCategory(id, { title: values.title, description: values.description || undefined });
        return { success: res.success, message: res.message };
      }}
      deleteMutation={async (id) => {
        const res = await deleteCategory(id);
        return { success: res.success, message: res.message };
      }}
    />
  );
};

export default CategoriesManagementPage;
