import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DRUGS: any[] = JSON.parse(readFileSync(resolve(process.cwd(), 'server/data/m.data'), 'utf8'))
const MIN_RATIO = 0.9
const MAX_QTY = 10
const MAX_CANDIDATES = 100

interface DrugItem {
  name: string
  spec: string
  price: number
  quantity: number
}

interface Candidate {
  items: DrugItem[]
  total: number
  diff: number
}

function weightedRandom(candidates: Candidate[]): Candidate {
  const weights = candidates.map(c => 1 / (c.diff + 1))
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  let r = Math.random() * totalWeight
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]
    if (r <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

function findCandidates(budget: number): Candidate[] {
  const minTotal = budget * MIN_RATIO
  const candidates: Candidate[] = []
  const n = DRUGS.length

  for (let i = 0; i < n; i++) {
    const pi = DRUGS[i].price
    for (let j = i + 1; j < n; j++) {
      const pj = DRUGS[j].price
      for (let k = j + 1; k < n; k++) {
        const pk = DRUGS[k].price
        const qiMax = Math.min(MAX_QTY, Math.floor((budget - pj - pk) / pi))
        for (let qi = 1; qi <= qiMax; qi++) {
          const remain1 = budget - pi * qi
          const qjMax = Math.min(MAX_QTY, Math.floor((remain1 - pk) / pj))
          for (let qj = 1; qj <= qjMax; qj++) {
            const remain2 = remain1 - pj * qj
            const qkMax = Math.min(MAX_QTY, Math.floor(remain2 / pk))
            const qkMin = Math.max(1, Math.ceil((minTotal - pi * qi - pj * qj) / pk))
            for (let qk = qkMin; qk <= qkMax; qk++) {
              const total = pi * qi + pj * qj + pk * qk
              if (total >= minTotal && total <= budget) {
                const candidate: Candidate = {
                  items: [
                    { ...DRUGS[i], quantity: qi },
                    { ...DRUGS[j], quantity: qj },
                    { ...DRUGS[k], quantity: qk },
                  ],
                  total,
                  diff: budget - total,
                }
                candidates.push(candidate)
                if (candidates.length > MAX_CANDIDATES) {
                  let maxIdx = 0
                  for (let m = 1; m < candidates.length; m++) {
                    if (candidates[m].diff > candidates[maxIdx].diff) maxIdx = m
                  }
                  candidates.splice(maxIdx, 1)
                }
              }
            }
          }
        }
      }
    }
  }

  candidates.sort((a, b) => a.diff - b.diff)
  candidates.reverse()
  return candidates
}

function formatResult(selected: Candidate, budget: number) {
  return {
    data: selected.items.map(item => ({
      name: item.name,
      spec: item.spec,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    })),
    summary: {
      budget,
      total: selected.total,
      diff: selected.diff,
    },
  }
}

export function run(budgetStr: string | number) {
  const budget = parseFloat(String(budgetStr))

  if (isNaN(budget) || budget <= 0) {
    return { data: [], error: '金额无效' }
  }

  const candidates = findCandidates(budget)

  if (candidates.length === 0) {
    return { data: [] }
  }

  const weights = candidates.map(c => 1 / (c.diff + 1))
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const totals = candidates.map(c => c.total)

  const candidatesSummary = {
    count: candidates.length,
    max_total: Math.max(...totals),
    min_total: Math.min(...totals),
    candidates: candidates.map((c, i) => ({
      index: i,
      items: c.items.map(item => `${item.name}x${item.quantity}`).join(' + '),
      total: c.total,
      diff: c.diff,
      probability: +(weights[i] / totalWeight * 100).toFixed(4) + '%',
    })),
  }

  const selected = weightedRandom(candidates)

  return {
    ...formatResult(selected, budget),
    candidates: candidatesSummary,
  }
}
