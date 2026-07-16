import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jagannathapuri.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile/', '/set-password/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
