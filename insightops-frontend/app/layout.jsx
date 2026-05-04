import "./globals.css";

export const metadata = {
  title: "InsightOps",
  description: "Real-time reliability monitoring dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
