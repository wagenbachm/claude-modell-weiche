# modell-weiche

Ein Claude-Code-Mod, das Kontingent spart: Jede Eingabe wird eingestuft und an das passende Modell geschickt.

| Stufe | Modell | Wann |
|---|---|---|
| klein | Haiku | kurze Fragen, Kleinkram |
| mittel | Sonnet | normale Arbeit: Code, Skripte, Recherche |
| schwer | Opus | Umbau, Architektur, Refactoring, Migration, Performance, knifflige Fehlersuche, sehr lange Anfragen |

Unklare Fälle stuft Haiku mit einer kurzen Rückfrage ein. Braucht eine „kleine“ Aufgabe mehr als drei Schritte, übernimmt Sonnet. Die Statuszeile zeigt bei jeder Antwort das Modell, z. B. `Antwort: Opus (schwer)`.

## An- und ausschalten

Im Chat:

- `/weiche aus`: Die Weiche ist aus, es antwortet das in der App gewählte Modell.
- `/weiche an`: Die Weiche ist wieder an.
- `/weiche status`: zeigt, ob sie an ist.
- `/weiche`: schaltet um.

Das gilt nur für den aktuellen Chat; jeder neue Chat startet eingeschaltet.

## Installation

In einer Terminal-Sitzung von Claude Code:

```
/plugin install modell-weiche --marketplace wagenbachm/claude-modell-weiche
```

Aus einer Shell:

```
claude plugin install modell-weiche --marketplace wagenbachm/claude-modell-weiche
```

In der Desktop-App: + neben dem Eingabefeld, dann Plugins, Add marketplace mit `wagenbachm/claude-modell-weiche`, dann Add plugin.
