import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { variants, VariantsProvider } from './index';
import type { VariantSelection } from './index';

interface CardProps {
  readonly label: string;
}

function DefaultCard({ label }: CardProps) {
  return <p>default {label}</p>;
}

function CompactCard({ label }: CardProps) {
  return <p>compact {label}</p>;
}

function DenseCard({ label }: CardProps) {
  return <p>dense {label}</p>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderInProvider(ui: ReactNode, selection: VariantSelection, enabled = true) {
  const wrap = (next: VariantSelection) => (
    <VariantsProvider enabled={enabled} selection={next}>
      {ui}
    </VariantsProvider>
  );
  const view = render(wrap(selection));
  return {
    ...view,
    select: (next: VariantSelection) => {
      view.rerender(wrap(next));
    },
  };
}

describe('variants', () => {
  it('renders the default variant without a provider', () => {
    const Card = variants('card', {
      default: DefaultCard,
      compact: () => Promise.resolve({ default: CompactCard }),
    });

    render(<Card label="a" />);

    expect(screen.getByText('default a')).toBeVisible();
  });

  it('renders the default variant and loads nothing while the gate is closed', () => {
    const loadCompact = vi.fn(() => Promise.resolve({ default: CompactCard }));
    const Card = variants('card', { default: DefaultCard, compact: loadCompact });

    renderInProvider(<Card label="a" />, { card: 'compact' }, false);

    expect(screen.getByText('default a')).toBeVisible();
    expect(loadCompact).not.toHaveBeenCalled();
  });

  it('renders the default variant for a name the group does not define', () => {
    const loadCompact = vi.fn(() => Promise.resolve({ default: CompactCard }));
    const Card = variants('card', { default: DefaultCard, compact: loadCompact });

    renderInProvider(<Card label="a" />, { card: 'toString' });

    expect(screen.getByText('default a')).toBeVisible();
    expect(loadCompact).not.toHaveBeenCalled();
  });

  it('keeps the current variant on screen until the selected one has loaded', async () => {
    const compact = deferred<{ default: typeof CompactCard }>();
    const Card = variants('card', { default: DefaultCard, compact: () => compact.promise });

    renderInProvider(<Card label="a" />, { card: 'compact' });
    expect(screen.getByText('default a')).toBeVisible();
    expect(screen.queryByText('compact a')).not.toBeInTheDocument();

    await act(async () => {
      compact.resolve({ default: CompactCard });
      await compact.promise;
    });

    expect(screen.getByText('compact a')).toBeVisible();
    expect(screen.getByText('default a')).not.toBeVisible();
  });

  it('switches every instance of a group at once', async () => {
    const Card = variants('card', {
      default: DefaultCard,
      compact: () => Promise.resolve({ default: CompactCard }),
    });

    renderInProvider(
      <>
        <Card label="a" />
        <Card label="b" />
      </>,
      { card: 'compact' }
    );

    expect(await screen.findByText('compact a')).toBeVisible();
    expect(screen.getByText('compact b')).toBeVisible();
  });

  it('accepts a loader that picks a named export', async () => {
    const Card = variants('card', {
      default: DefaultCard,
      compact: () => Promise.resolve({ CompactCard }).then((m) => m.CompactCard),
    });

    renderInProvider(<Card label="a" />, { card: 'compact' });

    expect(await screen.findByText('compact a')).toBeVisible();
  });

  it('passes props and refs through to the selected variant', async () => {
    function RefCard({ label, ref }: CardProps & { readonly ref?: Ref<HTMLParagraphElement> }) {
      return <p ref={ref}>compact {label}</p>;
    }
    const Card = variants('card', {
      default: RefCard,
      compact: () => Promise.resolve({ default: RefCard }),
    });
    const ref = createRef<HTMLParagraphElement>();

    renderInProvider(<Card label="a" ref={ref} />, { card: 'compact' });

    await screen.findAllByText('compact a');
    expect(ref.current).toBeVisible();
  });

  it('preserves the state of the previous variant when flipping back', async () => {
    function Counter({ label }: CardProps) {
      const [count, setCount] = useState(0);
      return (
        <button
          type="button"
          onClick={() => {
            setCount(count + 1);
          }}
        >
          {label} {count}
        </button>
      );
    }
    const Card = variants('card', {
      default: Counter,
      compact: () => Promise.resolve({ default: CompactCard }),
    });

    const view = renderInProvider(<Card label="clicks" />, {});
    fireEvent.click(screen.getByRole('button', { name: 'clicks 0' }));
    fireEvent.click(screen.getByRole('button', { name: 'clicks 1' }));

    view.select({ card: 'compact' });
    expect(await screen.findByText('compact clicks')).toBeVisible();

    view.select({});
    expect(screen.getByRole('button', { name: 'clicks 2' })).toBeVisible();
    expect(screen.getByText('compact clicks')).not.toBeVisible();
  });

  it('keeps only the current and the previous variant mounted', async () => {
    const Card = variants('card', {
      default: DefaultCard,
      compact: () => Promise.resolve({ default: CompactCard }),
      dense: () => Promise.resolve({ default: DenseCard }),
    });

    const view = renderInProvider(<Card label="a" />, {});
    view.select({ card: 'compact' });
    await screen.findByText('compact a');
    view.select({ card: 'dense' });
    await screen.findByText('dense a');

    expect(screen.getByText('dense a')).toBeVisible();
    expect(screen.getByText('compact a')).not.toBeVisible();
    expect(screen.queryByText('default a')).not.toBeInTheDocument();
  });

  it('renders the default variant in place of a variant that throws', async () => {
    const consoleError = vi.mocked(console.error).mockImplementation(() => undefined);
    function BrokenCard(): never {
      throw new Error('Broken variant');
    }
    const Card = variants('card', {
      default: DefaultCard,
      broken: () => Promise.resolve({ default: BrokenCard }),
    });

    renderInProvider(<Card label="a" />, { card: 'broken' });

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        '[variantlab] Variant "broken" of "card" failed to render. Showing the default variant instead.',
        expect.objectContaining({ message: 'Broken variant' }),
        expect.any(String)
      );
    });
    const [previous, fallback] = screen.getAllByText('default a');
    expect(previous).not.toBeVisible();
    expect(fallback).toBeVisible();
    consoleError.mockReset();
  });

  it('stays on the current variant when a variant fails to load', async () => {
    const consoleError = vi.mocked(console.error).mockImplementation(() => undefined);
    const compact = deferred<{ default: typeof CompactCard }>();
    const Card = variants('card', { default: DefaultCard, compact: () => compact.promise });

    renderInProvider(<Card label="a" />, { card: 'compact' });
    const chunkError = new Error('Chunk failed');
    await act(async () => {
      compact.reject(chunkError);
      await compact.promise.catch(() => undefined);
    });

    expect(screen.getByText('default a')).toBeVisible();
    expect(consoleError).toHaveBeenCalledWith(
      '[variantlab] Variant "compact" of "card" failed to load.',
      chunkError
    );
    consoleError.mockReset();
  });

  it('reports a loader that does not resolve to a component', async () => {
    const consoleError = vi.mocked(console.error).mockImplementation(() => undefined);
    const Card = variants('card', {
      default: DefaultCard,
      compact: () => Promise.resolve({ CompactCard }) as never,
    });

    renderInProvider(<Card label="a" />, { card: 'compact' });

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        '[variantlab] Variant "compact" of "card" did not resolve to a component. Return the module from import(), or pick an export with .then((m) => m.YourComponent).',
        { CompactCard }
      );
    });
    expect(screen.getByText('default a')).toBeVisible();
    consoleError.mockReset();
  });

  it('exposes the group id and variant names', () => {
    const Card = variants('card', {
      default: DefaultCard,
      compact: () => Promise.resolve({ default: CompactCard }),
    });

    expect(Card.variantsId).toBe('card');
    expect(Card.variantNames).toEqual(['default', 'compact']);
    expect(Card.displayName).toBe('Variants(card)');
  });

  it('rejects an empty group id', () => {
    expect(() => variants('', { default: DefaultCard })).toThrow(
      '[variantlab] variants() needs a non-empty group id.'
    );
  });
});
