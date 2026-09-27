import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Globe2, Lock, Scale, ShieldCheck, Smartphone, Target, TrendingUp, Zap } from "lucide-react";

const TITLE = "About Voltex — Vision, Mission & Legal";
const DESC =
  "Learn who we are, the vision and mission behind Voltex, and read our legal and risk disclaimer before trading digital assets.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  { icon: Smartphone, title: "Mobile-first trading", body: "Buy, sell and track leading digital assets from an intuitive app built for speed." },
  { icon: ShieldCheck, title: "Advanced security", body: "Encrypted sessions, strict account isolation and continuous monitoring protect every account." },
  { icon: TrendingUp, title: "Grow your wealth", body: "Live market data, portfolio analytics and transparent pricing to support better decisions." },
  { icon: Globe2, title: "Global access", body: "Trade around the clock with real-time prices sourced from global markets." },
];

function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="app-grid pointer-events-none absolute inset-x-0 top-0 h-96" />
      <div className="glow-orb pointer-events-none absolute -left-24 top-20 size-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="glow-orb pointer-events-none absolute -right-24 top-[40rem] size-80 rounded-full bg-accent/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-md bg-gradient-brand font-display font-bold text-primary-foreground shadow-brand">V</div>
          <span className="font-display text-xl font-semibold">Voltex</span>
        </Link>
        <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
          <a href="#about" className="hover:text-foreground">About</a>
          <a href="#vision" className="hover:text-foreground">Vision</a>
          <a href="#mission" className="hover:text-foreground">Mission</a>
          <a href="#legal" className="hover:text-foreground">Legal</a>
        </nav>
        <Link to="/auth" className="pressable rounded-full bg-gradient-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-brand">
          Get Started
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6">
        <section id="about" className="animate-fade-in py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">
            <span className="size-2 rounded-full bg-up" /> Trading for a brighter tomorrow
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            Smarter crypto trading for a <span className="bg-gradient-brand bg-clip-text text-transparent">brighter future</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Voltex is a digital asset platform that gives individuals the tools to buy, sell and manage
            cryptocurrency with clarity and confidence. We combine live market data, transparent flat
            fees and institutional-grade security in one elegant, easy-to-use experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Lock className="size-4" /> Secure</span>
            <span className="flex items-center gap-2"><Zap className="size-4" /> Fast</span>
            <span className="flex items-center gap-2"><Globe2 className="size-4" /> Global</span>
          </div>
        </section>

        <section className="border-y border-border/60 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Why Voltex</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Everything you need, all in one place</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="float-slow grid size-14 place-items-center rounded-xl border border-border bg-gradient-card text-brand shadow-brand">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-16 md:grid-cols-2">
          <article id="vision" className="rounded-2xl border border-border bg-gradient-card p-8">
            <Compass className="size-8 text-brand" />
            <h2 className="mt-4 font-display text-2xl font-bold">Our Vision</h2>
            <p className="mt-3 text-muted-foreground">
              A world where everyone can participate in the digital economy on equal terms — where
              access to modern financial assets is simple, transparent and secure, regardless of
              background or borders.
            </p>
          </article>
          <article id="mission" className="rounded-2xl border border-border bg-gradient-card p-8">
            <Target className="size-8 text-accent" />
            <h2 className="mt-4 font-display text-2xl font-bold">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              To build the most trusted place to trade digital assets by delivering accurate real-time
              pricing, clear and fair fees, rigorous protection of customer data, and an experience that
              helps people make informed decisions at every step.
            </p>
          </article>
        </section>

        <section id="legal" className="mb-16 rounded-2xl border border-border bg-surface/60 p-8">
          <div className="flex items-center gap-3">
            <Scale className="size-7 text-brand" />
            <h2 className="font-display text-2xl font-bold">Legal Disclaimer</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p><strong className="text-foreground">Risk warning.</strong> Digital assets are highly volatile and can lose some or all of their value. Past performance is not indicative of future results. Only trade with funds you can afford to lose.</p>
            <p><strong className="text-foreground">No investment advice.</strong> Information on Voltex, including prices, charts and analytics, is provided for general informational purposes only and does not constitute financial, investment, legal or tax advice. Consult a qualified professional before making financial decisions.</p>
            <p><strong className="text-foreground">Market data.</strong> Prices are sourced from third-party providers and may be delayed or inaccurate. Executed prices may differ from displayed prices. A flat 0.40% fee applies to each trade.</p>
            <p><strong className="text-foreground">Eligibility.</strong> You must be at least 18 years old and provide accurate identity and address information. Services may be restricted in certain jurisdictions, and it is your responsibility to comply with applicable local laws.</p>
            <p><strong className="text-foreground">Limitation of liability.</strong> To the fullest extent permitted by law, Voltex is not liable for losses arising from market movements, service interruptions, or third-party data errors.</p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Voltex. All rights reserved.
      </footer>
    </div>
  );
}
