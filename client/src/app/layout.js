import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata = {
  title: "LetMeCook — Temporary Real-World Coordination",
  description: "Temporary real-world coordination network.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#e6dfe4] dark:bg-[#121316] text-[#101214] dark:text-[#ffffff] antialiased transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

