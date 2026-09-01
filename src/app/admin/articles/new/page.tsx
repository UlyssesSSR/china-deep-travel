import { getCategories } from '@/lib/repo';
import ArticlesForm from '@/components/admin/ArticlesForm';

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">New Article</h1>
      <ArticlesForm categories={categories} mode="new" />
    </div>
  );
}
