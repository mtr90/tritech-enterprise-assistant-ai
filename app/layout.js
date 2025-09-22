import './globals.css'

export const metadata = {
  title: 'TriTech Enterprise Assistant - AI Enhanced',
  description: 'Intelligent assistant for Premium Pro Enterprise workbook with hybrid AI capabilities',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
