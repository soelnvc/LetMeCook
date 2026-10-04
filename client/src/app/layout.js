import "./globals.css";

export const metadata = {
  title: "LetMeCook — Temporary Real-World Coordination",
  description: "Temporary real-world coordination network.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-amber-500 selection:text-neutral-950">
        {children}
      </body>
    </html>
  );
}
