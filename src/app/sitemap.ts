import type { MetadataRoute } from 'next'
import { IsProduction, product } from '@/utils/constants'

const baseUrl = product.links.website

export default function sitemap(): MetadataRoute.Sitemap {
  if (!IsProduction) {
    return []
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}