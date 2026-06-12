import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.libraryContent.findUnique({
    where: { slug },
  });

  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title} | Jay Subhdra Library`,
    description: article.summary || article.subtitle || `Read ${article.title} in the Jay Subhdra Spiritual Library.`,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.libraryContent.findUnique({
    where: { slug },
    include: { categories: true, tags: true }
  });

  if (!article || article.status !== "Active") {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white pt-24 pb-20">
      {/* Article Header */}
      <header className="container max-w-4xl mx-auto px-6 mb-12">
        <Link 
          href="/library" 
          className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-orange-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Link>
        
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {article.categories.map((cat: any) => (
            <span key={cat.id} className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100/50 px-3 py-1 rounded-full border border-orange-200/50">
              {cat.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-zinc-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-xl md:text-2xl text-zinc-500 font-serif italic mb-8">
            {article.subtitle}
          </p>
        )}

        <div className="flex items-center gap-4 py-6 border-y border-zinc-100 mb-8">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl uppercase">
            {article.author.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-zinc-900">{article.author}</p>
            <p className="text-sm text-zinc-500">
              Published on {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {article.image && (
        <div className="container max-w-5xl mx-auto px-6 mb-16">
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-zinc-100">
            <Image
              src={getImageUrl(article.image)}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Rich Text Content */}
      <div className="container max-w-3xl mx-auto px-6">
        <div 
          className="prose prose-zinc prose-lg md:prose-xl prose-orange max-w-none 
          prose-headings:font-serif prose-headings:font-bold 
          prose-a:text-orange-600 hover:prose-a:text-orange-500
          prose-img:rounded-2xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-zinc-900 mr-2">Tags:</span>
            {article.tags.map(tag => (
              <span key={tag.id} className="text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
