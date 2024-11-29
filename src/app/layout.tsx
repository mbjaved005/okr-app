import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from './AuthProvider'; // Import the new AuthProvider component
import Navbar from './components/Navbar'; // Import the Navbar component

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Emumba OKR",
  description: "OKR app created internally for Emumba Employees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ backgroundColor: '#f0f4f8', margin: '0', padding: '0', minHeight: '100vh' }}>
        <AuthProvider>
          <Navbar /> {/* Add Navbar component here */}
          <main style={{ padding: '20px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}