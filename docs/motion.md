# Apply the free page transition to the card stack

Use **Page side-by-side** for child/back navigation and **Panel reveal** for the independent deck's entry. These are motion prescriptions, not a claim about the current source or test results. Keep the existing actions and state machine; no framework, dependency, account, or installation is needed.

## 1. Make the stack legible without changing its geometry

Keep every action, snooze, confirmation, and result card at the same `aspect-ratio: 5 / 7`, width, radius, and deck position. Put long content in the internal scroll area; never resize the card between steps or shrink essential text below 16px. The independent info card owns status and XP below the displayed buddy, outside all deck/card animation layers.

Show at most two **decorative**, noninteractive backing sheets, only when real remaining quests exist: `translateY(6px)` and `translateY(12px)`, with identical dimensions, a 1px border, and subtly different solid fills. No shadows, blur, rotation, or text scaling. Include these edges in deck bounds. Use `aria-hidden="true"` and `pointer-events: none`; they are not additional actionable cards or invented history.

## 2. Child/back transitions: 180ms, 8px, no blur

The public recipe uses 250ms, 8px travel, 3px blur, and `cubic-bezier(0.22, 1, 0.36, 1)`. Keep its direction and easing; reduce the duration to **180ms**, remove blur, and use **zero stagger**.

- Open a child: parent moves `translateX(0)` to `translateX(-8px)` while fading out; child moves `translateX(8px)` to `translateX(0)` while fading in.
- Back from a child: parent returns from `-8px` to `0`; child exits from `0` to `8px`.
- Root right opens precomputed action options. Child right/Back restores the exact parent; child left opens the same quest's snooze choices without nested snooze history. Other edits the prefilled prepared prompt in the same card and retains edits. Motion does not reinterpret gestures or run actions.
- For a consumed root card, use the existing action result first, then visually reveal the next card with `translateY(6px)` to `0`, opacity `0` to `1`, over 180ms. Do not award XP or advance the queue from an animation callback.

Apply these illustrative selectors to the existing card elements; they are not selectors verified against the active source:

```css
/* Adapted from Transitions.dev — Page side-by-side.
   https://transitions.dev/detail.html?t=page-side-by-side */
.card-stack {
  position: relative;
  aspect-ratio: 5 / 7;
}
.card-layer {
  position: absolute;
  inset: 0;
  transform: translateX(0);
  opacity: 1;
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms cubic-bezier(0.22, 1, 0.36, 1);
}
.card-layer[data-position='before'] {
  transform: translateX(-8px);
  opacity: 0;
  pointer-events: none;
}
.card-layer[data-position='after'] {
  transform: translateX(8px);
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .card-layer {
    transition: none;
    transform: none;
  }
}
```

Stage a newly mounted child in its `after` position before activating it; either retain the existing layers or establish the initial style before the next painted frame. Do not expect a transition when both states are applied before the browser computes the initial style. Retarget CSS transitions on rapid back/forward input; do not queue timers. Keep temporary outgoing DOM only for presentation, without duplicating form IDs or actionable controls.

Commit the existing navigation state immediately. Mark every inactive real card `inert` and `aria-hidden="true"`; opacity and pointer-events alone do not remove keyboard access. Focus the active heading or restore the originating control on back, without waiting 180ms. Preserve drafts. Keyboard navigation should switch immediately with no travel.

## 3. Independent deck entry and necessary placement

The public Panel reveal recipe informs only deck motion:

- Deck open: `translateY(24px)` / opacity `0` to `translateY(0)` / opacity `1`, **240ms**, `cubic-bezier(0.22, 1, 0.36, 1)`.
- Deck close: reverse those states over **160ms**. No blur, scale, or delayed interaction. Info is not inside this moving layer and never moves during child navigation.
- Position first: info follows below the displayed buddy. Near bottom, order is deck including circular actions, buddy, info. Lift the buddy only enough to fit info; place the deck independently above it.
- A deliberate user drop commits the new resting anchor whether the buddy is open or closed. Automatic boundary fitting never persists the temporary pose. Open drag moves info, not the deck; subsequent close/reopen must not return to an earlier user placement.
- No decorative buddy hop, click bounce, hover travel, or click-triggered pose change. If opening requires a boundary correction, move the actual dock along one short monotonic easing path, with no overshoot, delay, or separate sprite-position owner. When no correction is needed, clicking leaves the buddy and sprite still.

Reduced motion and keyboard navigation use immediate state changes without travel or delay. Do not depend on `transitionend` to finish a functional state change. This single-DOM motion is not proof of native multi-window behavior.

## 4. Sources and license

Read the actual free CSS and repository license. No premium code was fetched. The public library labels **Card stack hover** Pro; no code from that recipe is included. The card-navigation adaptations above do not authorize decorative buddy motion.

**Public documentation**

- Page side-by-side: https://transitions.dev/detail.html?t=page-side-by-side
- Panel reveal: https://transitions.dev/detail.html?t=panel-reveal
- Card resize: https://transitions.dev/detail.html?t=card-resize — inspected but rejected: animating width/height conflicts with the fixed card geometry.
- Accessibility: https://transitions.dev/detail.html?doc=accessibility
- Free/Pro labels: https://transitions.dev/library.html

**GitHub sources inspected through `gh-axi`**

- https://github.com/Jakubantalik/transitions.dev/blob/main/transitions/page-side-by-side/index.html
- https://github.com/Jakubantalik/transitions.dev/blob/main/transitions/panel-reveal/index.html
- https://github.com/Jakubantalik/transitions.dev/blob/main/LICENSE

The license is **not blanket MIT**. Transition snippets and skills use the custom Transitions.dev License: free use, modification, and shipping within personal/commercial products; no redistribution of the collection or a substantial part as a competing motion library. Free snippets need no paid plan, including company use. MIT applies separately to tooling, which this approach does not copy. Website design/branding are excluded.

Retain `Transitions.dev` provenance comments and source URLs when adapting snippets. Templates/themes/starter kits/UI kits have additional paid-plan and comment-retention conditions; do not assume the ordinary product grant covers those. Full terms: https://transitions.dev/terms.html.

## 5. Integration check for the owning agent

The integration check should exercise child/back, same-quest snooze, prepared-prompt edit restoration, and root right-action without changing semantics. Include reduced motion, a real motion-enabled click with no unnecessary buddy movement, keyboard focus, rapid navigation, narrow-window clipping, necessary boundary lift, and open-drag close/reopen placement retention while the deck stays fixed during drag. XP and job dispatch must not depend on motion. Record actual outcomes separately; this document makes no test-pass claim.
