import "./globals.css";
import { AppLayout } from "../components/AppLayout";

export const metadata = {
  title: "InsightOps",
  description: "Real-time reliability monitoring dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
