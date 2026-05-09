import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sokak Dostları',
  description: 'Bölgenizdeki sokak hayvanlarını takip edin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-orange-500">🐾 Sokak Dostları</h1>
            <p className="text-sm text-gray-500">Bölgenizdeki hayvanları takip edin</p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
