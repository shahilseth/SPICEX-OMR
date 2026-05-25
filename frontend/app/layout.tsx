import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export const metadata = {
  title: "SpiceX OMS — Operations Management System",
  description: "End-to-end spice manufacturing operations management: sourcing, factory, warehouse, sales, and distribution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#e5e7eb]">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}