import "./globals.css";

export const metadata = {
  title: "Advantage — Curated Insights for University Advancement",
  description:
    "Stay informed on philanthropy, engagement, innovation, awards, and events in higher education advancement.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
