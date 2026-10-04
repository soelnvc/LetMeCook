import "./globals.css";

export const metadata = {
  title: "LetMeCook — Temporary Real-World Coordination",
  description: "Temporary real-world coordination network.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafbfc] text-black antialiased">
        {children}
      </body>
    </html>
  );
}
