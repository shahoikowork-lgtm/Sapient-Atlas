/**
 * Grader eval harness — the regression rig for the brain (the multi-pass bar-check).
 * NOT a unit test: it calls the real Anthropic grader. Run:
 *   NODE_OPTIONS='--experimental-websocket' npx tsx --env-file=.env.local eval/grader/eval-grader.ts
 *
 * A permanent benchmark of labeled reps across categories — clear hits, clear misses, near
 * misses, edge cases, adversarial traps, and off-mission inputs. It runs the SHIPPED grader
 * (multi-pass, default 3) and reports the metrics that matter:
 *
 *  - HIGH-CONFIDENCE FALSE-PASS (the sacred metric): bad work the grader would AUTO-CLEAR
 *    (quality=hit AND confidence=high). This MUST be 0 — it is the only fatal error in
 *    production. The harness exits non-zero if any occurs, so it gates every grader/map change.
 *  - false-pass (low-confidence): a fake "hit" the gate still routes to a human — not fatal.
 *  - false-fail: good work not marked a hit — friction, caught by the retry loop.
 *  - calibration: errors should concentrate in LOW confidence (the gate catches them).
 *
 * The grader is non-deterministic at the margin; run it a few times to see variance.
 */
import { runRepCheck } from '@/lib/ai/rep-check'
import { resolveMissionBar } from '@/lib/atlas/mission-bar'
import { getConstraintByCode } from '@/lib/atlas/constraints'
import { methodPromptBlock } from '@/lib/atlas/constraints/types'

type Category = 'hit' | 'miss' | 'near_miss' | 'edge' | 'adversarial' | 'off_mission'
type Gold = { micro_skill: string; artifact: string; expected: 'hit' | 'not_hit'; category: Category; note: string }

const GOLD: Gold[] = [
  // ── unique_attribute ──────────────────────────────────────────────────────────────────
  { micro_skill: 'unique_attribute', expected: 'hit', category: 'hit', note: 'fact only they can say', artifact: 'FlowDesk is the only support tool that turns your call recordings into the objection-handling snippets reps paste mid-chat. Unlike Intercom, Zendesk, or Help Scout, none of them touch call audio.' },
  { micro_skill: 'unique_attribute', expected: 'not_hit', category: 'miss', note: 'pure adjective soup', artifact: 'FlowDesk is a powerful, intuitive, all-in-one platform for modern teams.' },
  { micro_skill: 'unique_attribute', expected: 'not_hit', category: 'adversarial', note: 'TRAP: "only" + "from the ground up" but a category truism', artifact: 'We are the only platform built from the ground up for modern teams.' },
  { micro_skill: 'unique_attribute', expected: 'not_hit', category: 'adversarial', note: 'TRAP: mechanism-shaped but generic and shared', artifact: 'We use AI to turn your data into actionable insights.' },
  { micro_skill: 'unique_attribute', expected: 'not_hit', category: 'near_miss', note: 'a fact, but a shared/mundane one', artifact: 'We integrate with Slack and export to CSV.' },
  // ── kill_adjective (proof over adjectives) ───────────────────────────────────────────
  { micro_skill: 'kill_adjective', expected: 'hit', category: 'hit', note: 'Ogilvy — checkable fact', artifact: 'At sixty miles an hour the loudest sound in this car is the electric clock.' },
  { micro_skill: 'kill_adjective', expected: 'not_hit', category: 'miss', note: 'empty superlatives', artifact: 'This platform is powerful, seamless, and best-in-class.' },
  { micro_skill: 'kill_adjective', expected: 'hit', category: 'edge', note: 'specific numbers, no empty adjectives', artifact: 'Processes two million events per second at a median latency of forty milliseconds.' },
  { micro_skill: 'kill_adjective', expected: 'not_hit', category: 'adversarial', note: 'TRAP: technical-sounding but all empty adjectives', artifact: 'Blazing-fast, enterprise-grade, and battle-tested at scale.' },
  // ── name_buyer ───────────────────────────────────────────────────────────────────────
  { micro_skill: 'name_buyer', expected: 'hit', category: 'hit', note: 'specific role + situation', artifact: 'For support leads at Series-B SaaS companies drowning in repeat tickets.' },
  { micro_skill: 'name_buyer', expected: 'not_hit', category: 'miss', note: 'everyone = no one', artifact: 'For modern teams who want to move faster.' },
  { micro_skill: 'name_buyer', expected: 'not_hit', category: 'near_miss', note: 'a segment, but not a role + situation', artifact: 'For B2B SaaS companies.' },
  // ── falsifiable_exclusion ────────────────────────────────────────────────────────────
  { micro_skill: 'falsifiable_exclusion', expected: 'hit', category: 'hit', note: 'three named rivals excluded by a fact', artifact: 'Tested against Zendesk, Intercom, and Help Scout — none of them turn call recordings into mid-chat objection snippets.' },
  { micro_skill: 'falsifiable_exclusion', expected: 'not_hit', category: 'miss', note: 'vague superiority', artifact: 'We are simply better than the other tools out there.' },
  { micro_skill: 'falsifiable_exclusion', expected: 'not_hit', category: 'adversarial', note: 'TRAP: names 3 rivals but the claim is not a real exclusion', artifact: 'Unlike Slack, Teams, and Zoom, we are built for deep focus.' },
  // ── name_alternative ─────────────────────────────────────────────────────────────────
  { micro_skill: 'name_alternative', expected: 'hit', category: 'hit', note: 'names the real alternative', artifact: 'Without us, support leads stitch together Zendesk macros by hand and hope reps remember them.' },
  { micro_skill: 'name_alternative', expected: 'not_hit', category: 'miss', note: 'vacuous "only solution"', artifact: 'We are the only solution out there for teams like yours.' },
  // ── attribute_to_value ───────────────────────────────────────────────────────────────
  { micro_skill: 'attribute_to_value', expected: 'hit', category: 'hit', note: 'attribute tied to priced value', artifact: 'We turn call recordings into mid-chat snippets, which means your reps handle objections live instead of escalating — so fewer deals slip.' },
  { micro_skill: 'attribute_to_value', expected: 'not_hit', category: 'miss', note: 'feature, no value', artifact: 'Now with advanced AI-powered analytics and a redesigned dashboard.' },
  { micro_skill: 'attribute_to_value', expected: 'not_hit', category: 'near_miss', note: 'attribute tied to a GENERIC value the buyer does not price', artifact: 'We turn call recordings into snippets, which helps your team be more productive.' },
  // ── spot_generic (flag the generic lines) ────────────────────────────────────────────
  { micro_skill: 'spot_generic', expected: 'hit', category: 'hit', note: 'flags specific lines + who could copy them', artifact: 'Generic lines: "the all-in-one platform" and "built for modern teams" — Intercom and Zendesk could both run those word for word.' },
  { micro_skill: 'spot_generic', expected: 'not_hit', category: 'miss', note: 'flags nothing', artifact: 'I read the page and it all looks specific and strong to me, nothing generic.' },
  // ── name_pain ────────────────────────────────────────────────────────────────────────
  { micro_skill: 'name_pain', expected: 'hit', category: 'hit', note: 'specific, recognizable pain', artifact: 'Reps paste the wrong objection rebuttal mid-chat and watch the deal go cold.' },
  { micro_skill: 'name_pain', expected: 'not_hit', category: 'miss', note: 'vague benefit, no pain', artifact: 'Helps your team be more efficient and productive.' },
  // ── repeatable_playback (a prospect plays it back) ───────────────────────────────────
  { micro_skill: 'repeatable_playback', expected: 'hit', category: 'hit', note: 'accurate unaided restatement', artifact: 'A prospect said back: "Oh, you are the one that turns support calls into the snippets reps paste live."' },
  { micro_skill: 'repeatable_playback', expected: 'not_hit', category: 'miss', note: 'vague/wrong restatement', artifact: 'A prospect said back: "So... it is some kind of support tool, I think?"' },
  // ── off-mission (must never auto-clear; ideally LOW confidence → human) ───────────────
  { micro_skill: 'unique_attribute', expected: 'not_hit', category: 'off_mission', note: 'OFF-MISSION (banana bread)', artifact: 'Here is my banana bread recipe: cream the butter and sugar, fold in mashed bananas and flour, then bake at 350 for an hour until golden.' },
  { micro_skill: 'unique_attribute', expected: 'not_hit', category: 'off_mission', note: 'OFF-MISSION (a support ticket)', artifact: 'Please reset my password, I have been locked out of my account since this morning and have a deadline.' },
]

async function main() {
  const m1 = getConstraintByCode('M1')!
  const method = methodPromptBlock(m1)
  let correct = 0
  let highConfFalsePass = 0 // the sacred, FATAL error — bad work that would auto-clear
  let lowConfFalsePass = 0 // a fake hit the gate still sends to a human (safe)
  let falseFail = 0 // good work not marked a hit (friction)
  let errorsLowConf = 0 // errors the gate would catch (good calibration)
  let errorsTotal = 0
  const rows: string[] = []

  for (const g of GOLD) {
    const bar = resolveMissionBar(g.micro_skill)
    const check = await runRepCheck({ missionTitle: g.micro_skill, bar: bar.barText, artifactText: g.artifact, methodBlock: method })
    const gotHit = check.quality === 'hit'
    const high = check.confidence === 'high'
    const ok = (g.expected === 'hit') === gotHit
    let mark: string
    if (ok) {
      correct++
      mark = '✅'
    } else {
      errorsTotal++
      if (!high) errorsLowConf++
      if (g.expected === 'not_hit' && gotHit) {
        if (high) {
          highConfFalsePass++
          mark = '🚨 HIGH-CONF FALSE-PASS'
        } else {
          lowConfFalsePass++
          mark = '⚠️  false-pass (low-conf → human)'
        }
      } else {
        falseFail++
        mark = '⚠️  false-fail'
      }
    }
    rows.push(
      `${mark}  [${g.category}/${g.micro_skill}] expect=${g.expected} got=${check.quality}/${check.confidence} (agree ${Math.round(check.agreement * 100)}%, ${check.passes}p) — ${g.note}`,
    )
  }

  const n = GOLD.length
  console.log(rows.join('\n'))
  console.log('\n────────────────────────────────────────')
  console.log(`N=${n}   accuracy=${Math.round((correct / n) * 100)}%   grader=${m1.version ? 'v' + m1.version : ''} (multi-pass)`)
  console.log(`🚨 HIGH-CONFIDENCE FALSE-PASS (auto-clears bad work — MUST be 0): ${highConfFalsePass}`)
  console.log(`⚠️  false-pass, low-confidence (gate routes to human, safe):       ${lowConfFalsePass}`)
  console.log(`⚠️  false-fail (good work not a hit — friction):                   ${falseFail}`)
  console.log(`calibration: ${errorsTotal ? Math.round((errorsLowConf / errorsTotal) * 100) : 100}% of errors were LOW confidence (the gate catches these)`)
  console.log(
    highConfFalsePass > 0
      ? '\nEVAL FAILED — the grader would AUTO-CLEAR bad work. Do not ship.'
      : '\nEVAL PASSED — no high-confidence fake clears.',
  )
  process.exit(highConfFalsePass > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('EVAL ERROR:', e instanceof Error ? e.stack : e)
  process.exit(1)
})
