import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Link href="/admin/ops" className="font-medium underline underline-offset-4">
        Operations console →
      </Link>
      <p className="text-black/50">Every active sprint at a glance — where each user is, their last rep, and what needs you.</p>
      <Link href="/admin/review" className="mt-2 text-black/60 underline underline-offset-4">
        Review queue (edge cases) →
      </Link>
      <Link href="/admin/reviews" className="text-black/60 underline underline-offset-4">
        All diagnoses →
      </Link>
      <Link href="/admin/metrics" className="text-black/60 underline underline-offset-4">
        Time to first win →
      </Link>
      <Link href="/admin/intelligence" className="text-black/60 underline underline-offset-4">
        Capability intelligence (transformation funnel) →
      </Link>
    </div>
  )
}
