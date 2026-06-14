import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GRN Data Extractor',
  description: 'Extract structured data from handwritten Goods Receipt Notes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
