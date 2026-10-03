import "./globals.css";
export const metadata = { title: "Desker Personal", description: "Your life, in one thread." };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
