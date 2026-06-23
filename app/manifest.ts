import type { MetadataRoute } from 'next'

// Web app manifest — Next auto-emits <link rel="manifest">. Powers the Android Chrome
// home-screen / install icon and theming.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sapient Atlas',
    short_name: 'Atlas',
    description: 'The Art of Becoming Harder to Replace.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f7f2',
    theme_color: '#1e2950',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
