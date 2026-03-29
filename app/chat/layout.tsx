import { Navbar } from "@/components/landing/Navbar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
}
