import Link from "next/link";
import Image from "next/image";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-purple)]/10 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center space-y-6">
        <Image
          src="/success.gif"
          alt="Success"
          width={350}
          height={350}
          className="mx-auto"
        />

        <h1 className="text-2xl font-semibold text-gray-800">Thank you!</h1>

        <p className="text-sm text-gray-600">
          Your message has been sent successfully. We’ll get back to you as soon
          as possible.
        </p>

        <Link
          href="/"
          className="inline-block bg-[var(--color-purple)] text-white
            px-6 py-2.5 rounded-lg font-semibold
            hover:bg-[var(--color-purple)]/90 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
