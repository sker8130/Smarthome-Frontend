"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePageClient() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <div className="relative pb-16 min-h-[650px]">
        {/* Background image */}
        <Image
          src="/Bannercontainer.png"
          alt="Background banner"
          fill
          priority
          className="object-cover z-0"
        />

        <div className="absolute inset-0 bg-[var(--color-purple)]/35 z-[1]" />

        {/* NAVBAR + HERO CONTENT */}
        <div className="relative z-10">
          {/* NAVBAR */}
          <header className="max-w-6xl mx-auto flex items-center justify-between pt-6 px-4">
            <div className="flex items-center gap-3">
              <Image
                src="/HEHUB_logo1.png"
                alt="HEHub logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>

            <nav className="hidden md:flex items-center gap-8 text-xl font-medium">
              <Link href="/" className="">
                Home
              </Link>
              <Link href="#feature" className="text-white/80 hover:text-white">
                Features
              </Link>
              <Link href="#contact" className="text-white/80 hover:text-white">
                Contact
              </Link>
              <Link href="/login" className="text-white/80 hover:text-white">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[var(--color-darkpurple)] text-white px-5 py-2 rounded-xl font-semibold hover:bg-white/90 hover:text-[var(--color-darkpurple)] transition"
              >
                Sign Up
              </Link>
            </nav>
          </header>

          {/* HERO CONTENT */}
          <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center pt-10 px-4">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Manage Your <br /> Home Energy <br />
                with <span className="">HEHub</span>
              </h1>
              <p className="text-sm md:text-base max-w-md">
                Monitor energy usage, automate devices and save costs. Control
                your smart home easily from one place.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/dashboard"
                  className="bg-white text-[var(--color-purple)] text-sm md:text-base font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-[#f4f2ff] transition"
                >
                  Get Started
                </Link>
                <Link
                  href="#feature"
                  className="bg-transparent border border-white/80 text-white text-sm md:text-base font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-[var(--color-purple)] transition"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center md:justify-end mt-5">
              <Image
                src="/3droom.png"
                alt="3D smart home"
                width={500}
                height={360}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </section>
        </div>
      </div>

      {/* FEATURE */}
      <section
        id="feature"
        className="bg-white py-16 md:py-20 px-4 flex flex-col items-center"
      >
        <h2 className="text-3xl font-semibold mb-10">Feature</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon="/feature1.svg"
            title="Energy Control"
            text="Forgetting to turn off electronic devices can make electricity bills soar. With this easy control, you can no longer waste electrical energy at home."
          />
          <FeatureCard
            icon="/feature2.svg"
            title="Increase Security"
            text="when you go out of the house and he forgets to turn off the electricity you can turn it off directly from the application without having to go back home."
          />
          <FeatureCard
            icon="/feature3.svg"
            title="Make Schedule"
            text="It's enough to control it via a smartphone, you don't need to be tired of walking to these devices to turn them off or on. This will be a convenience for users."
          />
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section
        id="contact"
        className="bg-[var(--color-purple)]/90 py-16 md:py-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-semibold mb-2">Get in touch</h2>
            <p className="text-sm md:text-base text-white/90">
              Questions about HEHub? We&apos;re here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white/10 border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.511511007789!2d106.6553268753092!3d10.772080259273393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec3c161a3fb%3A0xef77cd47a1cc691e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBCw6FjaCBraG9hIC0gxJDhuqFpIGjhu41jIFF14buRYyBnaWEgVFAuSENN!5e0!3m2!1svi!2s!4v1762560788843!5m2!1svi!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Form */}
            <form className="bg-white rounded-2xl p-6 md:p-8 shadow-lg space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Solution
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]/30"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[var(--color-purple)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color-purple)]/90 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--color-purple)] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8 items-center">
          {/* Left: logo & tagline */}
          <div className="flex items-start justify-center md:justify-start">
            <a href="#">
              <Image
                src="/intro.svg"
                alt="HEHub intro"
                width={260}
                height={160}
                className="object-contain"
                priority
              />
            </a>
          </div>

          {/* Middle: contact */}
          <div className="text-m space-y-4">
            <h4 className="font-semibold mb-3 text-2xl">Contact Us</h4>
            <p className="flex gap-2 items-center">
              <span>
                <img src="/icons/phone.svg" alt="phone icon" width={20} />
              </span>
              Hotline: 0387847976
            </p>
            <p className="flex gap-2 items-center">
              <span>
                <img
                  src="/icons/support_agent.svg"
                  alt="support agent icon"
                  width={20}
                />
              </span>
              Customer service
            </p>
            <p className="flex gap-3 items-center">
              <a href="#">
                <img src="/icons/facebook.svg" alt="facebook icon" width={20} />
              </a>
              <a href="#">
                <img
                  src="/icons/instagram.svg"
                  alt="instagram icon"
                  width={20}
                />
              </a>
              <a href="#">
                <img src="/icons/x.svg" alt="x icon" width={20} />
              </a>
              <a href="#">
                <img src="/icons/tiktok.svg" alt="tiktok icon" width={20} />
              </a>
              <a href="#">
                <img src="/icons/youtube.svg" alt="youtube icon" width={20} />
              </a>
            </p>
          </div>

          {/* Right: company info */}
          <div className="text-m space-y-2">
            <h4 className="font-semibold mb-1 text-2xl">Company Information</h4>
            <p className="flex gap-2 items-center">
              <span>
                <img src="/icons/home.svg" alt="home icon" width={20} />
              </span>
              Address: ...
            </p>
            <p className="flex gap-2 items-center">
              <span>
                <img src="/icons/email.svg" alt="email icon" width={20} />
              </span>
              Email: ...
            </p>
          </div>
        </div>

        <div className="border-t border-white/15 text-center text-[10px] py-3 text-white/80">
          Copyright © 2025 | sker
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="h-24 w-24 grid place-items-center rounded-full bg-[#f5f5ff] shadow-sm">
        <Image src={icon} alt={title} width={50} height={50} />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 max-w-xs">{text}</p>
    </div>
  );
}