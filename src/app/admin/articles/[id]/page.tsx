import { getCategories } from '@/lib/repo';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ArticlesForm from '@/components/admin/ArticlesForm';

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const categories = await getCategories();

  // Fetch article
  const { rows } = await db.query<any>(
    `SELECT * FROM articles WHERE id = ? LIMIT 1`,
    [params.id]
  );

  const article = rows[0];
  
  if (!article) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">Edit Article</h1>
      <ArticlesForm categories={categories} mode="edit" initial={article} id={params.id} />
    </div>
  );
}
