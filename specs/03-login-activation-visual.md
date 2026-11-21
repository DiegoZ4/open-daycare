# SPEC 03 — Login y activación de cuenta (visual)

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-18
> **Objective:** Implementar `/login` y `/activate-account` como cáscara visual fiel a `login.dc.html` y `activar-cuenta.dc.html`, sin selector de rol ni autenticación real.

## Por qué existe esta spec

Es la primera pantalla del lado familias (activación de cuenta) y define la salida visual de sesión: el logout del sidebar pasa de link muerto a `/login`. Además quita del login el selector "INGRESO COMO" (decisión del usuario), con lo que el formulario es único para ambos roles hasta que exista auth real. Ambas páginas viven fuera del shell de staff (precedente `/children/new` de la spec 02).

## Scope

**In:**

- Ruta `/login` fiel a `login.dc.html` **sin** el bloque "INGRESO COMO" ni botones Personal/Familia: split de 2 columnas (1.05fr/1fr) a ≥1024px con panel coral (gradiente 155deg, círculos decorativos, logo sol + "OpenDayCare", titular "El día de cada niño, compartido con su familia.", descripción y footer "🌿 Guardería Sala Soles") y columna de formulario (max 392px): "Iniciar sesión" Fredoka 30px, intro "Ingresá para ver el día de hoy.", EMAIL (`caro@opendaycare.com`), CONTRASEÑA (placeholder "••••••••"), "¿Olvidaste tu contraseña?" (muerto `#`), CTA gradiente "Iniciar sesión" → `/` y footer "Activá tu cuenta" → `/activate-account`.
- Ruta `/activate-account` fiel a `activar-cuenta.dc.html`: card centrada de 440px con ícono sol 58px, "Bienvenida a OpenDayCare", intro, card de invitación "Te invitaron a seguir a **Mateo · Sala Soles**" (avatar "M" `#A9D9E8`/`#1F7A93`), CÓDIGO DE INVITACIÓN (`7K4P9`, Fredoka 18px ls 3px), EMAIL (`lucia.fernandez@gmail.com`), CREAR CONTRASEÑA (borde `#F2A78E`, con valor), caja de autorización `#FBF1D6` marcada (estática) y CTA "Activar mi cuenta" (muerto `#`) + "¿Ya tenés cuenta? Iniciar sesión" → `/login`.
- Logout del sidebar (`app/components/sidebar.tsx`): `href="#"` → `/login`.
- Constantes inline en cada página (valores del comp); sin archivos de datos nuevos.
- Metadata de título: "Iniciar sesión · OpenDayCare" y "Activar cuenta · OpenDayCare".
- Responsive básico: en `<1024px` el login oculta el panel coral y centra el formulario; la activación reduce el padding lateral. Sin scroll horizontal a 375px.

**Out of scope (for future specs):**

- Autenticación real (validación, sesión, cookies, guards/redirects).
- Selector de rol Personal/Familia y lógica staff/familia (decisión del usuario).
- Submit o validación de formularios; checkbox de autorización interactivo.
- Recuperar contraseña (no existe comp).
- `familia-feed` y demás rutas del lado familias: siguen sin existir.
- Responsive completo (layouts tablet, menú mobile).

## Data model

Esta feature no introduce nuevas estructuras de datos: son cáscaras de una sola pantalla con constantes inline (código, email y datos del niño). Reutiliza el modelo de las specs 01–02 solo para lo visual (paleta de avatar de Mateo).

Tokens nuevos (además de los de las specs 01–02): fondo de ambas páginas `#FBF4EC` (distinto del `#F6ECDF` del staff) · login: panel gradiente `155deg #F6A98E→#F2937A 45%→#EC7E62` padding 56/60, círculos 420px `rgba(255,255,255,.12)` y 300px `rgba(255,255,255,.10)`, logo tile 46px radio 14 `rgba(255,255,255,.22)`, titular Fredoka 600 42px lh 1.12 blanco, descripción 17px lh 1.6 `rgba(255,255,255,.92)` max 430px, footer 14px `rgba(255,255,255,.9)` · formulario: h2 Fredoka 600 30px mb 6, intro 15px `#94887B` mb 28 · labels 12px **700** ls .7 `#94887B` mb 8 · inputs padding **14/16** radio 14 borde 1.5 `#EADFD0` bg blanco 15px · link "¿Olvidaste tu contraseña?" `#C5503A` 13.5px 700 · CTA padding 15 radio 15 gradiente `180deg #F4977E→#EE8164` blanco 800 16px sombra `0 10px 22px -8px rgba(238,129,100,.7)` · footers 14.5px `#94887B` con link `#C5503A` 800 · activación: card max 440px, ícono 58px radio 18 gradiente `155deg #F8C3A8→#F2937A` sombra `0 12px 26px -10px rgba(238,129,100,.65)`, h1 Fredoka 600 32px lh 1.15, intro 15.5px lh 1.55, card invitación blanca borde 1.5 `#EADFD0` radio 16 padding 14/16 con avatar 44px Fredoka 600 19px, código Fredoka 700 18px ls 3px, caja autorización `#FBF1D6` radio 14 con check 24px radio 8 `#5FB97E` y texto 14px `#8A7234` lh 1.45.

## Implementation plan

1. Crear `app/login/page.tsx` (server component estático, fuera del grupo `(staff)`; las fuentes vienen del layout raíz): split grid con panel coral `hidden lg:flex` y formulario centrado, campos con los valores del comp usando clases locales exactas, CTA → `/` (Link), "Activá tu cuenta" → `/activate-account`, forgot `#`, metadata de título. Manual: abrir `/login` renderiza el comp sin el selector; el CTA navega a `/`.
2. Crear `app/activate-account/page.tsx`: card de 440px centrada con constantes inline (código, email, "Mateo · Sala Soles"), caja de autorización estática marcada, CTA `#`, link → `/login`, metadata de título. Manual: `/login` ↔ `/activate-account` navegan entre sí en ambos sentidos.
3. Cambiar el logout en `app/components/sidebar.tsx` de `href="#"` a `/login`. Manual: desde `/` el logout lleva a `/login` y los ítems activos del nav no cambian (regresión specs 01–02).

## Acceptance criteria

- [x] Al abrir `http://localhost:3000/login` se renderiza el split del comp a 1280px: panel coral (logo, titular, descripción, footer "🌿 Guardería Sala Soles") y formulario de max 392px (título, intro, EMAIL, CONTRASEÑA, link, CTA, footer).
- [x] `/login` no contiene el bloque "INGRESO COMO" ni los botones Personal/Familia.
- [x] Los valores son los del comp: email `caro@opendaycare.com` y placeholder `••••••••` en login; código `7K4P9`, email `lucia.fernandez@gmail.com`, contraseña con valor y autorización marcada en `/activate-account`.
- [x] El CTA "Iniciar sesión" navega a `/` (feed).
- [x] "¿Olvidaste tu contraseña?" y "Activar mi cuenta" quedan como links muertos `#`.
- [x] "Activá tu cuenta" (login) navega a `/activate-account` y "Iniciar sesión" (activación) vuelve a `/login`.
- [x] Al abrir `http://localhost:3000/activate-account` se renderiza fiel al comp a 1280px: ícono, "Bienvenida a OpenDayCare", card de invitación con avatar `#A9D9E8`/`#1F7A93`, tres campos (contraseña con borde `#F2A78E`), caja `#FBF1D6` con check `#5FB97E`, CTA y footer.
- [x] Ambas páginas usan fondo `#FBF4EC` en toda la viewport (no el `#F6ECDF` global).
- [x] El logout del sidebar navega a `/login` sin alterar ítems activos ni el shell.
- [x] Títulos de pestaña: "Iniciar sesión · OpenDayCare" y "Activar cuenta · OpenDayCare".
- [x] A 375px: `/login` sin scroll horizontal, sin panel coral y con el formulario centrado; `/activate-account` sin scroll horizontal y card a ancho disponible.
- [x] Ningún link interno de las páginas nuevas lleva a una 404 (existen o son `#`).
- [x] Regresión: `/`, `/children`, `/children/new` y `/children/[id]` renderizan igual que tras la spec 02.
- [x] `npx tsc --noEmit` pasa.
- [x] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** eliminar el selector "INGRESO COMO Personal/Familia" — decisión del usuario; formulario único hasta que exista auth real.
- **Sí:** rutas `/login` y `/activate-account` en inglés — precedente de la spec 02.
- **Sí:** CTA "Iniciar sesión" → `/` — decisión del usuario; sin selector, el lado implementado es staff (rama staff del comp).
- **Sí:** CTA "Activar mi cuenta" → `#` — decisión del usuario; `familia-feed` no tiene spec, se convierte en link real cuando llegue (patrón Niños de la spec 02).
- **Sí:** logout del sidebar → `/login` — decisión del usuario; navegación sin lógica.
- **Sí:** valores prefilled del comp — decisión del usuario; fidelidad (specs 01–02).
- **Sí:** ocultar el panel coral en `<1024px` — decisión del usuario; login mobile solo con formulario.
- **Sí:** data de la invitación inline — decisión del usuario; cáscara de una card.
- **Sí:** páginas estáticas fuera del grupo `(staff)` — precedente `/children/new`.
- **Sí:** clases locales en vez de `form-field.tsx` — estos comps usan label 700 y padding 14/16; `FormField` usa 800 y 13/16 (spec 02). Fidelidad sin tocar lo verificado.
- **Sí:** checkbox de autorización estático marcado — réplica del comp.
- **No:** auth real, sesión o guards — specs futuras.
- **No:** selector de rol y lógica de roles — decisión del usuario.
- **No:** submit/validación y checkbox interactivo — cáscara visual.
- **No:** recuperar contraseña — no existe comp.
- **No:** `familia-feed` y demás rutas del lado familias — specs futuras.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El body global usa `#F6ECDF` y estos comps piden `#FBF4EC` | Cada página setea su contenedor `min-h-screen` con `#FBF4EC` (mismo patrón del layout `(staff)`); el body nunca queda expuesto |
| Ocultar el panel coral deja el login mobile sin branding | Decisión del usuario; si se echa de menos, un header compacto va en otra spec |
| El comp original cambia email/destino según el rol elegido | Se fija la rama staff (email `caro@`, CTA → `/`); se redefine con el auth real |
| CTAs principales muertos (`Activar mi cuenta`, forgot) | Fase de cáscara; criterios explícitos de aceptación y conversión futura al estilo de la spec 02 |

## What is **not** in this spec

- Autenticación real, selector de rol, recuperar contraseña, `familia-feed`, submit de formularios y responsive completo. Cada una, si llega, va en su propio spec.
