import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-2 text-5xl font-bold">404</h1>
      <p className="mb-6 text-neutral-600">
        The page you are looking for does not exist.
      </p>
      <Link href="/" className="rounded bg-black px-4 py-2 text-white">
        Go home
      </Link>
    </main>
  );
}
