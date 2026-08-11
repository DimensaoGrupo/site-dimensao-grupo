import { listCategories } from "@/lib/categories/queries";
import CategoryForm from "./CategoryForm";
import DeleteCategoryButton from "./DeleteCategoryButton";

export const metadata = { title: "Categorias — Painel Grupo Dimensão" };

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
      <p className="mt-1 text-sm text-gray-medium">Organize os posts do Blog por assunto.</p>

      <div className="mt-6 rounded-2xl border border-gray-light/70 bg-white p-5">
        <CategoryForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-light/70 bg-white">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-medium">Nenhuma categoria criada ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-light/60">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-semibold text-foreground">{category.name}</span>
                <DeleteCategoryButton id={category.id} name={category.name} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
