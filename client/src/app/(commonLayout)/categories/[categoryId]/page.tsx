import CategoryDetail from "@/components/modules/Categories/CategoryDetail";

interface CategoryDetailParams {
  params: Promise<{ categoryId: string }>;
}

const CategoryDetailPage = async ({ params }: CategoryDetailParams) => {
  const { categoryId } = await params;
  return <CategoryDetail categoryId={categoryId} />;
};

export default CategoryDetailPage;
