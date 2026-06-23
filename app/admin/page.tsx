import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Link href="/admin/reviews" className="font-medium underline underline-offset-4">
        All diagnoses →
      </Link>
      <p className="text-black/50">Every diagnosis, newest first, with status and a result link. Open one to review.</p>
      <Link href="/admin/review" className="mt-2 text-black/60 underline underline-offset-4">
        Pending-only queue →
      </Link>
    </div>
  )
}
