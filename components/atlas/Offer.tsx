import { ButtonLink } from './Button'
import { Eyebrow } from './Eyebrow'

// The risk-reversed first offer, stated plainly. Honest about V1: only the Marketing
// positioning Sprint is sellable today. No new pricing, no subscription.
export function Offer() {
  return (
    <div className="rounded-3xl border border-s-line bg-s-panel p-6 shadow-s sm:p-8">
      <Eyebrow>The first Sprint</Eyebrow>
      <h3 className="mt-3 text-h2 text-s-text">It’s open for marketers.</h3>
      <p className="mt-3 max-w-[62ch] text-body text-s-text-2">
        If your work sounds like your competitors’, positioning is the fix, whether you work in SEO,
        paid, content, product marketing, email, demand generation, or growth. Thirty days, on your
        own campaigns and pages. By the end, a real prospect can say why you, not the other three.
      </p>
      <div className="mt-7 flex flex-col gap-4 border-t border-s-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-h3 text-s-text">$149, once</div>
          <div className="text-label text-s-muted">No subscription. The diagnosis is free.</div>
        </div>
        <ButtonLink href="/diagnosis" size="lg">
          Get your free diagnosis
        </ButtonLink>
      </div>
    </div>
  )
}
