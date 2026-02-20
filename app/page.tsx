import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Hello World</h1>
      <p className="text-lg text-foreground/80">
        Next.js App Router app is running successfully.
      </p>
      <Link
        href="/list"
        className="rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90"
      >
        Open Supabase List
      </Link>
    </main>
  );
}
