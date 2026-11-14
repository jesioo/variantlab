import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import type { JSX, ReactPortal, ToggleEvent } from 'react';
import { createPortal } from 'react-dom';

import { DEFAULT_VARIANT } from '../group';
import type { VariantGroup, VariantStatus } from '../group';
import type { VariantSelection, VariantsPanelPosition } from '../types';
import { panelStyles } from './styles';

/** Below this many groups, a search field would only get in the way. */
const SEARCH_THRESHOLD = 6;

export interface PanelProps {
  readonly groups: readonly VariantGroup[];
  readonly selection: VariantSelection;
  readonly onSelectionChange: (selection: VariantSelection) => void;
  readonly position: VariantsPanelPosition;
}

/**
 * The floating button and the popover it opens. It renders into a shadow root at the end of
 * `<body>`, so the page's styles cannot reach it and its styles cannot leak into the page.
 */
export default function Panel(props: PanelProps): ReactPortal {
  const [root] = useState(createPanelRoot);

  useEffect(() => {
    document.body.append(root.host);
    return () => {
      root.host.remove();
    };
  }, [root]);

  return createPortal(<PanelContent {...props} />, root.container);
}

interface PanelRoot {
  readonly host: HTMLElement;
  readonly container: HTMLElement;
}

function createPanelRoot(): PanelRoot {
  const host = document.createElement('variantlab-panel');
  const shadow = host.attachShadow({ mode: 'open' });
  // A constructed style sheet is not an inline style, so a strict Content Security Policy allows it.
  if ('adoptedStyleSheets' in shadow && typeof CSSStyleSheet.prototype.replaceSync === 'function') {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(panelStyles);
    shadow.adoptedStyleSheets = [sheet];
  } else {
    const style = document.createElement('style');
    style.textContent = panelStyles;
    shadow.append(style);
  }
  const container = document.createElement('div');
  shadow.append(container);
  return { host, container };
}

function PanelContent({ groups, selection, onSelectionChange, position }: PanelProps): JSX.Element {
  const popoverId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const openedWithKeyboard = useRef(false);
  const [query, setQuery] = useState('');
  const searchable = groups.length >= SEARCH_THRESHOLD;
  const shownGroups = searchable ? filterGroups(groups, query) : groups;
  const changedCount = groups.filter(
    (group) => selectedName(group, selection) !== DEFAULT_VARIANT
  ).length;

  const select = (group: VariantGroup, name: string): void => {
    const rest = withoutGroups(selection, [group.id]);
    onSelectionChange(name === DEFAULT_VARIANT ? rest : { ...rest, [group.id]: name });
  };

  const reset = (): void => {
    onSelectionChange(
      withoutGroups(
        selection,
        groups.map((group) => group.id)
      )
    );
  };

  const handleToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    if (event.newState !== 'open') return;
    // Someone who opens the panel is about to switch, so fetch every variant up front.
    for (const group of groups) group.preload();
    // The search field takes focus either way. A dropdown only does for keyboard users, as its
    // focus ring would look like an error to someone who clicked.
    const target = openedWithKeyboard.current
      ? 'input[type="search"], select'
      : 'input[type="search"]';
    event.currentTarget.querySelector<HTMLElement>(target)?.focus({ preventScroll: true });
  };

  const handleBeforeToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    if (event.newState !== 'closed') return;
    // Browsers do not hand focus back across the shadow boundary, so do it here. Only when focus
    // is inside, so a click elsewhere on the page keeps the focus it moved.
    const popover = event.currentTarget;
    const root = popover.getRootNode();
    const focused = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
    if (focused !== null && popover.contains(focused)) {
      launcherRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <div className="panel" data-position={position}>
      <div
        id={popoverId}
        popover="auto"
        role="dialog"
        aria-label="Variants"
        className="popover"
        onBeforeToggle={handleBeforeToggle}
        onToggle={handleToggle}
      >
        <div className="header">
          {searchable ? (
            <input
              type="search"
              className="search"
              placeholder="Search groups"
              aria-label="Search groups"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
          ) : (
            <h2 className="title">Variants</h2>
          )}
          <button type="button" className="reset" disabled={changedCount === 0} onClick={reset}>
            Reset
          </button>
        </div>
        {shownGroups.length > 0 ? (
          <ul className="groups">
            {shownGroups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                selected={selectedName(group, selection)}
                onSelect={(name) => {
                  select(group, name);
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="empty">No groups match.</p>
        )}
      </div>
      <button
        ref={launcherRef}
        type="button"
        className="launcher"
        popoverTarget={popoverId}
        onClick={(event) => {
          // A click from Enter or Space has no pointer behind it, so its detail is 0.
          openedWithKeyboard.current = event.detail === 0;
        }}
        aria-label={changedCount === 0 ? 'Variants' : `Variants, ${String(changedCount)} changed`}
      >
        <LayersIcon />
        {changedCount > 0 && <span className="indicator" aria-hidden="true" />}
      </button>
    </div>
  );
}

interface GroupRowProps {
  readonly group: VariantGroup;
  readonly selected: string;
  readonly onSelect: (name: string) => void;
}

function GroupRow({ group, selected, onSelect }: GroupRowProps): JSX.Element {
  const selectId = useId();
  const status = useVariantStatus(group, selected);

  return (
    <li className="group">
      <label htmlFor={selectId} className="group-id" title={group.id}>
        {group.id}
      </label>
      <div className="picker">
        <select
          id={selectId}
          className="select"
          value={selected}
          data-changed={selected !== DEFAULT_VARIANT}
          onChange={(event) => {
            onSelect(event.target.value);
          }}
        >
          {group.variantNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {status === 'loading' ? <span className="spinner" aria-hidden="true" /> : <ChevronIcon />}
      </div>
      {status === 'failed' && (
        <p className="error">Failed, showing the default. See the console.</p>
      )}
    </li>
  );
}

function ChevronIcon(): JSX.Element {
  return (
    <svg
      className="chevron"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 6.25 8 9.75l3.5-3.5" />
    </svg>
  );
}

function LayersIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2.25 14 5.5 8 8.75 2 5.5Z" />
      <path d="M2 8.5 8 11.75 14 8.5" />
      <path d="M2 11.25 8 14.5 14 11.25" opacity="0.5" />
    </svg>
  );
}

function useVariantStatus(group: VariantGroup, name: string): VariantStatus {
  const getStatus = () => group.getStatus(name);
  return useSyncExternalStore(group.subscribe, getStatus, getStatus);
}

/** The variant a group renders: its selected variant if the group defines it, else the default. */
function selectedName(group: VariantGroup, selection: VariantSelection): string {
  const selected = selection[group.id];
  return selected !== undefined && group.variantNames.includes(selected)
    ? selected
    : DEFAULT_VARIANT;
}

function withoutGroups(selection: VariantSelection, ids: readonly string[]): VariantSelection {
  return Object.fromEntries(Object.entries(selection).filter(([id]) => !ids.includes(id)));
}

function filterGroups(groups: readonly VariantGroup[], query: string): readonly VariantGroup[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return groups;
  return groups.filter(
    (group) =>
      group.id.toLowerCase().includes(needle) ||
      group.variantNames.some((name) => name.toLowerCase().includes(needle))
  );
}
