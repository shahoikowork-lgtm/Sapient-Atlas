import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Link href="/admin/review" className="font-medium underline underline-offset-4">
        Review queue →
      </Link>
      <p className="text-black/50">Approve or reject pending diagnosis output.</p>
    </div>
  )
}
