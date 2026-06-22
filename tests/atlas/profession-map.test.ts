import { describe, it, expect } from 'vitest'
import {
  PROFESSION_MAP,
  PROFESSIONS,
  getCatalogEntry,
  isActiveV1Code,
  isKnownCode,
  catalogCodes,
} from '@/lib/atlas/profession-map'

describe('Atlas Profession Map', () => {
  it('covers all nine professions with five constraints each', () => {
    expect(PROFESSIONS).toHaveLength(9)
    expect(PROFESSION_MAP).toHaveLength(45)
    for (const p of PROFESSIONS) {
      expect(PROFESSION_MAP.filter((e) => e.profession === p)).toHaveLength(5)
    }
  })

  it('has unique codes', () => {
    expect(new Set(catalogCodes()).size).toBe(PROFESSION_MAP.length)
  })

  it('marks exactly one constraint active in V1 — M1 (marketing)', () => {
    const active = PROFESSION_MAP.filter((e) => e.active_v1)
    expect(active.map((e) => e.code)).toEqual(['M1'])
    expect(active[0].profession).toBe('marketing')
  })

  it('resolves entries by code', () => {
    expect(getCatalogEntry('M1')?.name).toBe('Generic positioning')
    expect(getCatalogEntry('D1')?.profession).toBe('design')
    expect(getCatalogEntry('ZZ9')).toBeUndefined()
    expect(getCatalogEntry(null)).toBeUndefined()
  })

  it('isActiveV1Code is true only for M1', () => {
    expect(isActiveV1Code('M1')).toBe(true)
    expect(isActiveV1Code('M2')).toBe(false)
    expect(isActiveV1Code('D1')).toBe(false)
    expect(isActiveV1Code(null)).toBe(false)
  })

  it('isKnownCode distinguishes catalog codes from off-map', () => {
    expect(isKnownCode('SA1')).toBe(true)
    expect(isKnownCode('M1')).toBe(true)
    expect(isKnownCode('ZZ9')).toBe(false)
    expect(isKnownCode(null)).toBe(false)
  })

  it('every entry has a non-empty matching signal', () => {
    for (const e of PROFESSION_MAP) expect(e.signal.trim().length).toBeGreaterThan(0)
  })
})
