---
description: Verifica los acceptance criteria de un spec, corrige lo que falle y marca los checks (delega en el agente spec-verify)
agent: spec-verify
subagent: true
---

Verificá los acceptance criteria del spec $ARGUMENTS y marcá los checks en su sección `## Acceptance criteria`.

Si no vino ningún spec, listá los archivos de `specs/*.md` y preguntá cuál verificar.
