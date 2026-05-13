---
name: Hero + section typewriter reveal
overview: Staggered console-style typewriter with pink-to-final on essentially all home-page copy that is not a button, while leaving ResumeOnePager (embedded SWE sheet) effectively untouched.
todos:
  - id: primitive
    content: Add shared TypewriterLine / segment primitive (pink while typing, color transition on line complete, cursor, prefers-reduced-motion bypass, sr-only full text)
    status: completed
  - id: section-heading
    content: Integrate primitive into SectionHeading (h2 → eyebrow → subtitle stagger); keep whileInView + fadeUp
    status: completed
  - id: hero
    content: HeroSection—type all non-button copy (h1, eyebrow, body); exclude only true buttons / btn-accent (e.g. See Works); optional fade-only for secondary text link if it reads cleaner
    status: completed
  - id: about-works-socials-body
    content: About ContentBlock titles + bodies; WorkCard title/role/description/chips (exclude View more button + icon-only links); Socials cards—static prose (name, handle, description); stagger order per block when in view
    status: completed
  - id: posts
    content: PostsSection—all non-button copy (h2, body, Stay tuned line unless it fights the blink motif)
    status: completed
  - id: resume-boundary
    content: ResumeSection—SectionHeading + any other non-button prose outside the one-pager; Download PDF stays non-typewriter; do not open or refactor ResumeOnePager for this feature
    status: completed
  - id: polish
    content: Tune char speed / caps for long bodies; viewport-gated start; verify reduced-motion
    status: completed
---

# Staggered typewriter + pink-to-final (copy-wide, SWE sheet frozen)

## Guiding rule

- **Apply** the typewriter + pink→final treatment to **all readable copy that is not a button** across the home sections in scope.
- **Exclude** from typing: **`<button>`**, **`btn-accent`** (and the same family of primary CTAs), **icon-only** controls (e.g. external link icon on WorkCard), and **anything inside the embedded SWE one-pager** (see below).
- **Plain `<a>`** text (e.g. hero “or find me online”, social “Open on …”) is *not* a button by default—**include** in typing unless it feels too busy during implementation; if so, document a narrow exception for CTA link labels only.

## Hard boundary: `ResumeOnePager`

- **Do not** add typewriter logic, new wrappers, or meaningful markup/CSS changes inside **[client/src/features/home/components/ResumeOnePager.tsx](client/src/features/home/components/ResumeOnePager.tsx)** or **[client/src/features/home/components/ResumeOnePager.module.css](client/src/features/home/components/ResumeOnePager.module.css)**.
- The user-highlighted subtree (**`<article class="...__sheet ...__embedded">`** and everything under it—name, contact line, summary, bullets, etc.) stays **static** and **relatively untouched**.
- **[client/src/features/home/components/ResumeSection.tsx](client/src/features/home/components/ResumeSection.tsx)** may still use the effect on the **SectionHeading** (and any other non-button prose **above** the CyberPanel). The **Download PDF** control remains a normal button (no typing).

## In scope (by area)

| Area | What gets typed (stagger within each logical block / `whileInView`) |
|------|------------------------------------------------------------------------|
| **Hero** | `h1`, eyebrow, body `p`. Exclude **See Works** (`btn-accent`). |
| **SectionHeading** (About, Works, Socials, Resume intro) | `h2` (title + accent + tail) → eyebrow → subtitle—via shared [SectionHeading.tsx](client/src/components/shared/SectionHeading.tsx). |
| **About** | Each [ContentBlock](client/src/features/home/components/AboutSection.tsx) `h3` + body `p` (per card, after section heading sequence or interleaved—pick a clear per-block order in implementation). |
| **Works** | [WorkCard](client/src/features/home/components/WorkCard.tsx): project name, role/timeframe line, description, tech chips. **Exclude** “View more” `<button>` and icon-only `worklink-btn` `<a>`. |
| **Socials** | Card name, handle, description (stagger per card on reveal). CTA anchors: follow guiding rule above. |
| **Posts** | [PostsSection.tsx](client/src/features/home/components/PostsSection.tsx): heading, body, “Stay tuned” line (unless it clashes with existing blink—then leave that line static). |

## Out of scope

- **ResumeOnePager** inner DOM (embedded sheet article and descendants)—no typewriter, no structural churn for this feature.
- **WorkModal** and other dialogs—unless you explicitly extend later.
- **Buttons** and **icon-only** actions as listed above.

## Behavior (unchanged)

- Non-accent text types in **`rgb(var(--accent-bright))`**, then **`transition: color`** to the final token when that **line/segment** is fully revealed. Accent-colored spans stay accent (optional per-character reveal without a second fade).
- **`prefers-reduced-motion: reduce`**: show full text + final colors immediately; keep existing Framer motion where present.
- **a11y**: full strings for assistive tech from first paint (`sr-only` or equivalent); typing cursor `aria-hidden`.

## Implementation notes

1. **Shared primitive** under `client/src/components/shared/` (or similar), reused by SectionHeading, Hero, About blocks, WorkCard, Socials card content, Posts.
2. **Viewport**: start typing when the same `whileInView` / section visibility conditions already used for fades fire (`once: true` patterns preserved).
3. **Long text**: clamp ms/char or max duration for About bodies and Work descriptions so pages stay snappy.
4. **SectionHeading `ReactNode` props**: stringify or restrict to `string` for typed slots; verify current call sites.
