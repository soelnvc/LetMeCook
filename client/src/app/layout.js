import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LetMeCook — Temporary Real-World Coordination",
  description: "Temporary real-world coordination network.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`${inter.className} min-h-screen bg-[#fafbfc] text-black antialiased`}>
        {children}
      </body>
    </html>
  );
}
