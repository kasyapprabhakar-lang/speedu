import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://speedu.in'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/book`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/packers-movers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/track`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
  ]
}
