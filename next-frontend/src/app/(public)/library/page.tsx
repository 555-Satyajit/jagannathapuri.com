import { Suspense } from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import LibraryMobileFilter from "@/components/library/LibraryMobileFilter";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;

  if (categorySlug) {
    const category = await prisma.libraryCategory.findUnique({
      where: { slug: categorySlug }
    });

    if (category) {
      return {
        title: category.meta_title || `${category.name} | Spiritual Library | Jay Subhdra`,
        description: category.meta_description || `Explore spiritual texts, articles, and knowledge bases about ${category.name}.`,
        keywords: category.meta_keywords || undefined,
      };
    }
  }

  return {
    title: "Spiritual Library | Jay Subhdra",
    description: "Explore spiritual texts, articles, and knowledge bases about Jagannath Temple, Vedas, and rituals.",
  };
}

export const revalidate = 3600;

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;
  
  const limit = 6;
  const skip = (page - 1) * limit;

  // Build the where clause for filtering
  const whereClause: any = { status: "Active" };
  if (categorySlug) {
    whereClause.categories = {
      some: { slug: categorySlug }
    };
  }

  // Fetch data in parallel
  const [articles, totalArticles, categories, newlyArrived] = await Promise.all([
    prisma.libraryContent.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: { categories: true, tags: true }
    }),
    prisma.libraryContent.count({ where: whereClause }),
    prisma.libraryCategory.findMany({
      where: { status: "Active" },
      orderBy: { name: "asc" }
    }),
    prisma.libraryContent.findMany({
      where: { status: "Active" },
      orderBy: { created_at: "desc" },
      take: 4,
      include: { categories: true }
    })
  ]);

  const totalPages = Math.ceil(totalArticles / limit);

  return (
    <div className="min-h-screen bg-[#fcfaf8] pt-24 pb-20">
      <div className="container max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif font-bold text-zinc-900">
            {categorySlug ? `Category: ${categories.find((c: any) => c.slug === categorySlug)?.name || categorySlug}` : 'Library Articles'}
          </h1>
          {categorySlug && (
            <Link href="/library" className="text-sm font-semibold text-orange-600 hover:underline hidden lg:block">
              Clear Filter
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full">
            
            {/* Mobile Category Dropdown */}
            <LibraryMobileFilter categories={categories} />

            {articles.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 bg-white rounded-3xl border border-zinc-100">
                <p>No articles found for this selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 mb-12">
                {articles.map((article: any) => (
                  <Link 
                    href={`/library/${article.slug}`} 
                    key={article.id}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-300"
                  >
                    {article.image ? (
                      <div className="relative w-full h-32 md:h-56 bg-zinc-100 overflow-hidden">
                        <Image
                          src={getImageUrl(article.image)}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-32 md:h-56 bg-orange-50 flex items-center justify-center">
                        <i className="fas fa-book-open text-orange-200 text-3xl md:text-5xl" />
                      </div>
                    )}
                    
                    <div className="p-3 md:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4 flex-wrap">
                        {article.categories.slice(0, 1).map((cat: any) => (
                          <span key={cat.id} className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm line-clamp-1">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-sm md:text-xl font-serif font-bold text-zinc-900 mb-1.5 md:mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight md:leading-normal">
                        {article.title}
                      </h3>
                      
                      {article.summary && (
                        <p className="text-zinc-600 text-xs md:text-sm leading-relaxed mb-3 md:mb-6 line-clamp-2 md:line-clamp-3 flex-1">
                          {article.summary}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-2 md:pt-4 border-t border-zinc-100 flex items-center justify-between text-[10px] md:text-xs text-zinc-500 font-medium">
                        <span className="truncate max-w-[60%]">{article.author}</span>
                        <span className="shrink-0">{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link 
                    href={`/library?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                    className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                
                <span className="text-sm font-medium text-zinc-500 mx-4">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages && (
                  <Link 
                    href={`/library?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                    className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar (Stacks at bottom on mobile, sticky on desktop) */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-8">
            
            {/* Categories Widget (Hidden on mobile due to dropdown) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-zinc-200 p-6">
              <h3 className="text-lg font-serif font-bold text-zinc-900 mb-4 pb-4 border-b border-zinc-100">
                Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/library" 
                    className={`block py-1.5 text-sm font-medium transition-colors ${!categorySlug ? 'text-orange-600' : 'text-zinc-600 hover:text-orange-600'}`}
                  >
                    All Articles
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link 
                      href={`/library?category=${cat.slug}`}
                      className={`block py-1.5 text-sm font-medium transition-colors ${categorySlug === cat.slug ? 'text-orange-600' : 'text-zinc-600 hover:text-orange-600'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newly Arrived Widget */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <h3 className="text-lg font-serif font-bold text-zinc-900 mb-4 pb-4 border-b border-zinc-100">
                Newly Arrived
              </h3>
              <div className="space-y-4">
                {newlyArrived.map((item: any) => (
                  <Link href={`/library/${item.slug}`} key={item.id} className="group flex gap-3 items-start">
                    {item.image ? (
                      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                        <Image src={getImageUrl(item.image)} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">
                        <i className="fas fa-book-open text-orange-200 text-xl" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
