import Image from "next/image";
import { ADDS_ICONS } from "@/components/AddsIcons";
import type { Dict } from "@/lib/content/en";

/**
 * "What Studio adds": an introduction with a photograph on the left, five feature cards on the right.
 *
 * StudioFeatures
 * ├── FeaturesIntro   eyebrow, heading, description
 * ├── FeaturesGrid    five FeatureCards, laid out with CSS Grid (3 over 2, then 2 across, then 1)
 * └── FeaturesPhoto   the interior photograph, arched at the top right
 *
 * Words come from the dictionaries and the card count is whatever `items` holds; nothing here is sized in
 * pixels to English, so translated titles wrap instead of clipping. The page layout lives in globals.css.
 */
type Adds = Dict["adds"];

function FeatureCard({ icon, title, body }: Readonly<{ icon: React.ReactNode; title: string; body: string }>) {
  return (
    <li className="adds-card">
      <span className="adds-ico">{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </li>
  );
}

export default function StudioFeatures({
  t,
  eyebrow,
  heading,
  description,
}: Readonly<{ t: Adds; eyebrow: string; heading: string; description: string }>) {
  return (
    <section className="adds" id="features" aria-labelledby="features-title">
      <div className="adds-inner">
        <div className="col-head adds-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="features-title">{heading}</h2>
          <p>{description}</p>
        </div>

        <ul className="adds-grid">
          {t.items.map((it, i) => (
            <FeatureCard key={it.title} icon={ADDS_ICONS[i]} title={it.title} body={it.body} />
          ))}
        </ul>

        <figure className="adds-photo">
          <Image
            src="/img/studio-lounge.jpg"
            alt={t.imageAlt}
            width={1448}
            height={1086}
            sizes="(max-width: 1100px) 100vw, 45vw"
            quality={80}
          />
        </figure>
      </div>
    </section>
  );
}
