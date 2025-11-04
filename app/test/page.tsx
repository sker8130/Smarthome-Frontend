import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Home | HEHub",
};

export default function HomePage() {
  return (
    <main className="text-gray-800 bg-[var(--color-purple)]">
      {/* NAVBAR */}
      <header className="flex items-center justify-between max-w-6xl mx-auto py-5 px-4">
        <div className="flex items-center gap-2">
          <Image src="/HEHUB_logo1.png" alt="HEHub logo" width={150} height={150} />
        </div>

        <nav className="hidden md:flex items-center gap-8 text-2xl font-medium">
          <Link href="#" className="text-primary">Home</Link>
          <Link href="#feature" className="hover:text-primary">Features</Link>
          <Link href="#contact" className="hover:text-primary">Contact</Link>
          <Link href="/login" className="hover:text-primary">Login</Link>
          <Link
            href="/register"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="bg-primary/90 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-10 py-16 px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Manage Your Home Energy <br /> with{" "}
              <span className="text-white">HEHub</span>
            </h1>
            <p className="text-gray-100 mb-6 text-lg">
              Monitor energy usage, automate devices and save costs.
            </p>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="bg-[var(--color-darkpurple)] text-primary font-medium px-5 py-3 rounded-lg hover:bg-gray-100 hover:text-[var(--color-darkpurple)] transition-all"
              >
                Get Started
              </Link>
              <Link
                href="#feature"
                className="border border-transparent bg-gray-100 text-[var(--color-darkpurple)] font-medium px-5 py-3 rounded-lg hover:bg-opacity-0 hover:border-2 hover:border-[var(--color-darkpurple)] hover-text-primary transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              src="/3droom.png"
              alt="3D home room"
              width={480}
              height={380}
              priority
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="feature" className="max-w-6xl mx-auto text-center py-20 px-4">
        <h2 className="text-3xl font-semibold mb-12">Feature</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon="/feature1.svg"
            title="Energy Control"
            text="Forget to turn off devices? With HEHub you can manage electricity smartly and reduce waste."
          />
          <FeatureCard
            icon="/feature2.svg"
            title="Increase Security"
            text="Turn off power remotely when you’re away, keeping your home secure and efficient."
          />
          <FeatureCard
            icon="/feature3.svg"
            title="Make Schedule"
            text="Automate and schedule your home appliances easily from your smartphone."
          />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-primary/10 py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden">
            <Image
              src="/map-placeholder.png"
              alt="Map"
              width={600}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <form className="bg-white rounded-2xl p-8 shadow-md space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800">Get in touch</h3>
            <p className="text-sm text-gray-600">
              Questions about HEHub? We&apos;re here to help.
            </p>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <textarea
              placeholder="Solution"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        
        <div className="text-center text-sm border-t border-white/20 py-4">
          © 2025 | sker
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="h-20 w-20 grid place-items-center rounded-full bg-primary/10">
        <Image src={icon} alt={title} width={40} height={40} />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm">{text}</p>
    </div>
  );
}
