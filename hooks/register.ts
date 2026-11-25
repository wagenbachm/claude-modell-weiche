import type { Register } from 'claude-code'

type Stufe = 'klein' | 'mittel' | 'schwer'
const MODELL: Record<Stufe, string> = { klein: 'haiku', mittel: 'sonnet', schwer: 'opus' }
// Ab so vielen Schritten (Tool-Runden) wird eine "kleine" Aufgabe an Sonnet übergeben.
const ESCALATE_AT_STEP = 3

const HARD = /\b(architektur|architecture|umbau|großer? umbau|refaktor\w*|refactor\w*|migrier\w*|migrat\w*|race condition|deadlock|speicherleck|memory leak|knifflig|tricky|warum (geht|funktioniert)|root cause|ursache|sicherheitslücke|security audit|performance|optimier\w*|gesamte[ns]? (projekt|codebase)|ganze[ns]? (projekt|codebase))\b/i
const WORK = /\b(bau|baue|implementier|programmier|debug|fix|behebe|schreib|erstell|analysier|review|teste|deploy|build|implement|write|create|analy[sz]e)\w*/i

let stufe: Stufe = 'mittel'
// Gilt nur für diesen Chat; jeder neue Chat startet eingeschaltet.
let aktiv = true

function guess(text: string): Stufe | undefined {
  const t = text.trim()
  if (HARD.test(t) || t.length > 1500) return 'schwer'
  if (WORK.test(t) || t.length > 400 || t.includes('```')) return undefined // Haiku entscheidet mittel/schwer
  if (t.length < 60) return 'klein'
  return undefined
}

function short(model: string): string {
  const m = model.toLowerCase()
  if (m.includes('haiku')) return 'Haiku'
  if (m.includes('sonnet')) return 'Sonnet'
  if (m.includes('opus')) return 'Opus'
  if (m.includes('fable')) return 'Fable'
  return model
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'weiche',
      description: 'Modell-Weiche in diesem Chat: /weiche an | aus | status',
    })
    return next(e)
  })

  on('command.run', { command: 'weiche' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'an' || arg === 'ein' || arg === 'on') aktiv = true
    else if (arg === 'aus' || arg === 'off') aktiv = false
    else if (arg === '') aktiv = !aktiv
    $.ui.status(aktiv ? 'Weiche: an' : 'Weiche: aus')
    return {
      text: aktiv
        ? 'Modell-Weiche ist AN: Haiku / Sonnet / Opus je nach Aufgabe.'
        : 'Modell-Weiche ist AUS: Es antwortet das in der App gewählte Modell.',
    }
  })

  on('prompt.submit', async ($, e, next) => {
    if (!aktiv || e.command || e.isMeta) {
      stufe = 'mittel'
      return next(e)
    }
    let s = guess(e.text)
    if (s === undefined) {
      const res = await $.model.complete({
        model: 'haiku',
        prompt:
          'Antworte nur mit KLEIN, MITTEL oder SCHWER.\n' +
          'KLEIN = einfache Frage, Smalltalk, kurze Auskunft, Kleinkram.\n' +
          'MITTEL = normale Arbeit: Code schreiben/ändern, Skript, Recherche, Zusammenfassung.\n' +
          'SCHWER = großer Umbau, Architektur, knifflige Fehlersuche mit unklarer Ursache, viele Dateien, tiefes Nachdenken.\n\nAnfrage:\n' +
          e.text.slice(0, 2000),
      }).catch(() => undefined)
      const t = res?.isAnswered ? res.text.toUpperCase() : ''
      s = t.includes('SCHWER') ? 'schwer' : t.includes('KLEIN') ? 'klein' : 'mittel'
    }
    stufe = s
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e)
    if (!aktiv) {
      $.ui.status(`Antwort: ${short(e.model)} (Weiche aus)`)
      return yield* next(e)
    }
    const s: Stufe = stufe === 'klein' && e.index >= ESCALATE_AT_STEP ? 'mittel' : stufe
    const model = MODELL[s]
    $.ui.status(`Antwort: ${short(model)} (${s})`)
    return yield* next({ ...e, model })
  })
}
