export const panelStyles = /* css */ `
:host {
  all: initial;
  position: fixed;
  inset: 0 auto auto 0;
  width: 0;
  height: 0;
  z-index: 2147483647;
}

.panel {
  --background: #0e0e11;
  --surface: #1a1b20;
  --surface-hover: #25262d;
  --border: #2a2b33;
  --text: #f4f4f5;
  --dimmed: #8d90a0;
  --accent: #fbbf24;
  --danger: #f87171;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --launcher-size: 36px;
  --gap: 8px;
  --inset-top: max(16px, env(safe-area-inset-top));
  --inset-right: max(16px, env(safe-area-inset-right));
  --inset-bottom: max(16px, env(safe-area-inset-bottom));
  --inset-left: max(16px, env(safe-area-inset-left));
  --popover-offset: calc(var(--launcher-size) + var(--gap));
  --enter-y: 4px;

  color-scheme: dark;
  color: var(--text);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}

.panel *,
.panel *::before,
.panel *::after {
  box-sizing: border-box;
}

.panel[data-position^='top'] {
  --enter-y: -4px;
}

/* Launcher */

.launcher {
  position: fixed;
  display: grid;
  place-items: center;
  width: var(--launcher-size);
  height: var(--launcher-size);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--background);
  color: var(--text);
  box-shadow:
    0 0 0 1px var(--border),
    0 8px 16px -4px rgb(0 0 0 / 0.3),
    0 2px 4px -1px rgb(0 0 0 / 0.2);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    transform 160ms var(--ease-out);
}

.launcher svg {
  width: 18px;
  height: 18px;
}

.launcher:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}

.launcher:active {
  transform: scale(0.94);
}

.indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
}

.panel[data-position^='bottom'] .launcher {
  bottom: var(--inset-bottom);
}

.panel[data-position^='top'] .launcher {
  top: var(--inset-top);
}

.panel[data-position$='left'] .launcher {
  left: var(--inset-left);
}

.panel[data-position$='right'] .launcher {
  right: var(--inset-right);
}

/* Popover */

.popover {
  position: fixed;
  inset: auto;
  flex-direction: column;
  width: min(320px, calc(100vw - var(--inset-left) - var(--inset-right)));
  max-height: min(
    440px,
    calc(100dvh - var(--inset-top) - var(--inset-bottom) - var(--popover-offset))
  );
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: var(--background);
  color: var(--text);
  box-shadow:
    0 0 0 1px var(--border),
    0 16px 32px -8px rgb(0 0 0 / 0.45),
    0 4px 8px -2px rgb(0 0 0 / 0.25);
  opacity: 0;
  transform: translateY(var(--enter-y)) scale(0.97);
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out),
    overlay 150ms allow-discrete,
    display 150ms allow-discrete;
}

.popover:popover-open {
  display: flex;
  opacity: 1;
  transform: none;
}

@starting-style {
  .popover:popover-open {
    opacity: 0;
    transform: translateY(var(--enter-y)) scale(0.97);
  }
}

.panel[data-position^='bottom'] .popover {
  bottom: calc(var(--inset-bottom) + var(--popover-offset));
}

.panel[data-position^='top'] .popover {
  top: calc(var(--inset-top) + var(--popover-offset));
}

.panel[data-position$='left'] .popover {
  left: var(--inset-left);
}

.panel[data-position$='right'] .popover {
  right: var(--inset-right);
}

.panel[data-position='bottom-left'] .popover {
  transform-origin: bottom left;
}

.panel[data-position='bottom-right'] .popover {
  transform-origin: bottom right;
}

.panel[data-position='top-left'] .popover {
  transform-origin: top left;
}

.panel[data-position='top-right'] .popover {
  transform-origin: top right;
}

.header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 41px;
  padding: 6px 6px 6px 12px;
  border-bottom: 1px solid var(--border);
}

.title {
  flex: 1;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.search {
  flex: 1;
  min-width: 0;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text);
  font: inherit;
}

.search::placeholder {
  color: var(--dimmed);
}

.reset {
  flex: none;
  height: 28px;
  margin: 0;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dimmed);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.reset:disabled {
  opacity: 0.45;
  cursor: default;
}

.reset:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: -2px;
}

.groups {
  margin: 0;
  padding: 6px 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 0.2) transparent;
}

/* The group id takes one half of the row and its variant picker the other. */
.group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  row-gap: 4px;
  padding: 4px 12px;
}

.group-id {
  overflow: hidden;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: default;
}

.picker {
  position: relative;
  min-width: 0;
}

.select {
  appearance: none;
  display: block;
  width: 100%;
  height: 28px;
  margin: 0;
  padding: 0 28px 0 9px;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--border);
  color: var(--dimmed);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.select[data-changed='true'] {
  color: var(--text);
}

.select:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 1px;
}

.select option {
  background: var(--background);
  color: var(--text);
}

.chevron,
.spinner {
  position: absolute;
  top: 50%;
  right: 9px;
  pointer-events: none;
}

.chevron {
  width: 12px;
  height: 12px;
  margin-top: -6px;
  color: var(--dimmed);
}

.spinner {
  width: 10px;
  height: 10px;
  margin-top: -5px;
  border: 1.5px solid var(--dimmed);
  border-right-color: transparent;
  border-radius: 999px;
  animation: spin 600ms linear infinite;
}

.error {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--danger);
  font-size: 12px;
  text-wrap: pretty;
}

.empty {
  margin: 0;
  padding: 12px;
  color: var(--dimmed);
}

@media (hover: hover) {
  .launcher:hover {
    background: var(--surface-hover);
  }

  .reset:enabled:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .select:hover {
    background: var(--surface-hover);
  }
}

@media (pointer: coarse) {
  .panel {
    --launcher-size: 44px;
  }

  .launcher svg {
    width: 20px;
    height: 20px;
  }

  .title,
  .group-id {
    font-size: 15px;
  }

  .select {
    height: 36px;
  }

  /* Anything smaller makes iOS zoom into the field. */
  .search,
  .select {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .popover,
  .popover:popover-open {
    transform: none;
  }

  .launcher:active {
    transform: none;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;
