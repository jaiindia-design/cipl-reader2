import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CIPL -  document Data Extractor research',
  description: 'Extract structured data from handwritten or computer generated CIPL document',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
