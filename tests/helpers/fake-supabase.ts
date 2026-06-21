// A tiny in-memory stand-in for the Supabase service-role client, supporting exactly
// the query surface the app uses: from / select / insert / update / eq / in / is /
// order / limit / maybeSingle / single, plus `await`-ing a builder directly.
//
// It actually stores rows, so tests assert against real resulting state (e.g.
// "one value_assessments row with status 'approved'") instead of inspecting mock
// call args. Not a real query engine, just enough to exercise the route logic.

type Row = Record<string, any>
type Filter = { kind: 'eq' | 'in' | 'is'; col: string; val: any }
type Result = { data: any; error: { message: string } | null }

const ID_PREFIX: Record<string, string> = {
  users: 'user',
  diagnoses: 'diag',
  cycles: 'cycle',
  value_assessments: 'va',
  moves: 'move',
  predictions: 'pred',
  plans: 'plan',
  submissions: 'sub',
  subscriptions: 'subn',
  value_history: 'vh',
  proof: 'proof',
}

// Global monotonic counter so that both seeded rows and rows inserted later get
// strictly increasing ids / created_at in insertion order. This keeps
// `order('created_at', { ascending: true })` equal to insertion order.
let SEQ = 0
const STAMP_BASE = 1_700_000_000_000

function stamp(): string {
  return new Date(STAMP_BASE + SEQ).toISOString()
}

class Builder implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' = 'select'
  private payload: Row | Row[] | null = null
  private filters: Filter[] = []
  private orderCol: string | null = null
  private orderAsc = true
  private limitN: number | null = null

  constructor(
    private tables: Record<string, Row[]>,
    private table: string,
  ) {}

  private get rows(): Row[] {
    return (this.tables[this.table] ??= [])
  }

  select(_cols?: string): this {
    return this
  }
  eq(col: string, val: any): this {
    this.filters.push({ kind: 'eq', col, val })
    return this
  }
  in(col: string, val: any[]): this {
    this.filters.push({ kind: 'in', col, val })
    return this
  }
  is(col: string, val: any): this {
    this.filters.push({ kind: 'is', col, val })
    return this
  }
  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderCol = col
    this.orderAsc = opts?.ascending !== false
    return this
  }
  limit(n: number): this {
    this.limitN = n
    return this
  }
  insert(payload: Row | Row[]): this {
    this.op = 'insert'
    this.payload = payload
    return this
  }
  update(payload: Row): this {
    this.op = 'update'
    this.payload = payload
    return this
  }

  private match(): Row[] {
    let out = this.rows.filter((r) =>
      this.filters.every((f) => {
        if (f.kind === 'eq') return r[f.col] === f.val
        if (f.kind === 'in') return f.val.includes(r[f.col])
        if (f.kind === 'is') return r[f.col] === f.val // used as is(col, null)
        return true
      }),
    )
    if (this.orderCol) {
      const col = this.orderCol
      out = [...out].sort((a, b) => {
        const av = a[col]
        const bv = b[col]
        if (av === bv) return 0
        const cmp = av > bv ? 1 : -1
        return this.orderAsc ? cmp : -cmp
      })
    }
    if (this.limitN != null) out = out.slice(0, this.limitN)
    return out
  }

  private exec(): Result {
    if (this.op === 'insert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
      const inserted = list.map((r) => {
        SEQ++
        const row: Row = { ...r }
        if (row.id == null) row.id = `${ID_PREFIX[this.table] ?? this.table}_${SEQ}`
        if (row.created_at == null) row.created_at = stamp()
        this.rows.push(row)
        return row
      })
      return { data: Array.isArray(this.payload) ? inserted : inserted[0], error: null }
    }
    if (this.op === 'update') {
      const matched = this.match()
      for (const r of matched) Object.assign(r, this.payload)
      return { data: matched, error: null }
    }
    return { data: this.match(), error: null }
  }

  maybeSingle(): Promise<Result> {
    const { data } = this.exec()
    const row = Array.isArray(data) ? (data[0] ?? null) : (data ?? null)
    return Promise.resolve({ data: row, error: null })
  }
  single(): Promise<Result> {
    const { data } = this.exec()
    const row = Array.isArray(data) ? (data[0] ?? null) : data
    return Promise.resolve({ data: row, error: row ? null : { message: 'no rows' } })
  }
  then<R1 = Result, R2 = never>(
    onfulfilled?: ((value: Result) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return Promise.resolve(this.exec()).then(onfulfilled, onrejected)
  }
}

export type FakeStore = {
  tables: Record<string, Row[]>
  from: (table: string) => Builder
  rows: (table: string) => Row[]
}

// seed: { users: [...], cycles: [...], ... }. Seeded rows get an id/created_at if
// they don't already have one, in the order given.
export function createFakeStore(seed: Record<string, Row[]> = {}): FakeStore {
  const tables: Record<string, Row[]> = {}
  for (const [table, rows] of Object.entries(seed)) {
    tables[table] = (rows ?? []).map((r) => {
      SEQ++
      const row: Row = { ...r }
      if (row.id == null) row.id = `${ID_PREFIX[table] ?? table}_${SEQ}`
      if (row.created_at == null) row.created_at = stamp()
      return row
    })
  }
  return {
    tables,
    rows: (table: string) => (tables[table] ??= []),
    from: (table: string) => new Builder(tables, table),
  }
}
