import "./globals.css";

export const metadata = {
  title: { default: "HEHub", template: "HEHub | %s" },
  description: "Smart home energy management platform",
  icons: { icon: "/favicon.ico"},
  
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
