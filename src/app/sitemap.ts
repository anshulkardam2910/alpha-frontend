import type { MetadataRoute } from 'next'
import { IsProduction, product } from '@/utils/constants'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

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
  ]
}