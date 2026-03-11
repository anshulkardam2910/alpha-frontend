import type { MetadataRoute } from 'next'
import { IsProduction, product } from '@/utils/constants'

const baseUrl = product.links.website

export default function robots(): MetadataRoute.Robots {
  if (!IsProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}