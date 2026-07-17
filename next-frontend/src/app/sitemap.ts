import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jagannathapuri.com'

  // Fetch all active products
  const products = await prisma.product.findMany({
    where: { status: 1 },
    select: { slug: true, updated_at: true },
  })

  // Fetch all shop categories
  const categories = await prisma.category.findMany({
    select: { slug: true, updated_at: true },
  })

  // Fetch all active library articles
  const libraryArticles = await prisma.libraryContent.findMany({
    where: { status: 'Active' },
    select: { slug: true, updated_at: true },
  })

  // Fetch all active library categories
  const libraryCategories = await prisma.libraryCategory.findMany({
    where: { status: 'Active' },
    select: { slug: true, updated_at: true },
  })

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product-details/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/shop?category=${category.slug}`,
    lastModified: category.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const libraryArticleUrls: MetadataRoute.Sitemap = libraryArticles.map((article) => ({
    url: `${baseUrl}/library/${article.slug}`,
    lastModified: article.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const libraryCategoryUrls: MetadataRoute.Sitemap = libraryCategories.map((category) => ({
    url: `${baseUrl}/library?category=${category.slug}`,
    lastModified: category.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/daily-rituals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panchang`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  return [
    ...staticUrls, 
    ...categoryUrls, 
    ...productUrls, 
    ...libraryArticleUrls, 
    ...libraryCategoryUrls
  ]
}
