import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { variants, VariantsProvider } from '../index';
import type { VariantSelection } from '../index';

interface CardProps {
  readonly label: string;
}

function DefaultCard({ label }: CardProps) {
  return <p>default {label}</p>;
}

function CompactCard({ label }: CardProps) {
  return <p>compact {label}</p>;
}

function defineCard(id: string) {
  return variants(id, {
    default: DefaultCard,
    compact: () => Promise.resolve({ default: CompactCard }),
  });
}

function panelHost() {
  return document.querySelector('variantlab-panel');
}

/**
 * Queries inside the panel's shadow root, once the lazily loaded panel has rendered.
 *
 * jsdom hides popovers but cannot open them, so role queries include hidden elements. The
 * browser tests in the playground cover opening and closing the panel.
 */
async function findPanel() {
  return vi.waitFor(() => {
    const container = panelHost()?.shadowRoot?.lastElementChild;
    if (!(container instanceof HTMLElement)) throw new Error('The panel has not rendered.');
    return within(container);
  });
}

async function pick(groupId: string, name: string) {
  const panel = await findPanel();
  const picker = panel.getByRole('combobox', { hidden: true, name: groupId });
  fireEvent.change(picker, { target: { value: name } });
}

describe('panel', () => {
  it('shows only while the gate is open and a group is mounted', async () => {
    const Card = defineCard('card');
    const { rerender } = render(<VariantsProvider enabled>{null}</VariantsProvider>);
    expect(panelHost()).toBeNull();

    rerender(
      <VariantsProvider enabled>
        <Card label="a" />
      </VariantsProvider>
    );
    const panel = await findPanel();
    expect(panel.getByRole('button', { name: 'Variants' })).toBeInTheDocument();

    rerender(
      <VariantsProvider enabled={false}>
        <Card label="a" />
      </VariantsProvider>
    );
    expect(panelHost()).toBeNull();
  });

  it('removes itself once the last group unmounts', async () => {
    const Card = defineCard('card');
    const { rerender } = render(
      <VariantsProvider enabled>
        <Card label="a" />
      </VariantsProvider>
    );
    await findPanel();

    rerender(<VariantsProvider enabled>{null}</VariantsProvider>);

    expect(panelHost()).toBeNull();
  });

  it('lists the mounted groups by id and switches them', async () => {
    const Card = defineCard('card');
    const Banner = defineCard('banner');
    defineCard('unmounted');
    const onSelectionChange = vi.fn();
    render(
      <VariantsProvider enabled onSelectionChange={onSelectionChange}>
        <Card label="a" />
        <Card label="b" />
        <Banner label="c" />
      </VariantsProvider>
    );

    const panel = await findPanel();
    expect(panel.getAllByText(/^(banner|card|unmounted)$/).map((id) => id.textContent)).toEqual([
      'banner',
      'card',
    ]);

    await pick('card', 'compact');

    expect(onSelectionChange).toHaveBeenCalledWith({ card: 'compact' });
    expect(await screen.findByText('compact a')).toBeVisible();
    expect(screen.getByText('compact b')).toBeVisible();
    expect(screen.getByText('default c')).toBeVisible();
    expect(panel.getByRole('button', { name: 'Variants, 1 changed' })).toBeInTheDocument();
    expect(panel.getByRole('combobox', { hidden: true, name: 'card' })).toHaveValue('compact');
    expect(panel.getByRole('combobox', { hidden: true, name: 'banner' })).toHaveValue('default');

    await pick('card', 'default');

    expect(onSelectionChange).toHaveBeenLastCalledWith({});
    expect(screen.getByText('default a')).toBeVisible();
    expect(panel.getByRole('button', { name: 'Variants' })).toBeInTheDocument();
  });

  it('leaves a controlled selection to its owner', async () => {
    const Card = defineCard('card');
    const onSelectionChange = vi.fn();
    render(
      <VariantsProvider enabled selection={{}} onSelectionChange={onSelectionChange}>
        <Card label="a" />
      </VariantsProvider>
    );

    await pick('card', 'compact');

    expect(onSelectionChange).toHaveBeenCalledWith({ card: 'compact' });
    expect(screen.getByText('default a')).toBeVisible();
    expect(screen.queryByText('compact a')).not.toBeInTheDocument();
  });

  it('resets the groups on the page and keeps the selection of other groups', async () => {
    const Card = defineCard('card');
    const onSelectionChange = vi.fn();
    const selection: VariantSelection = { card: 'compact', elsewhere: 'compact' };
    const { rerender } = render(
      <VariantsProvider enabled selection={selection} onSelectionChange={onSelectionChange}>
        <Card label="a" />
      </VariantsProvider>
    );

    const panel = await findPanel();
    fireEvent.click(panel.getByRole('button', { hidden: true, name: 'Reset' }));

    expect(onSelectionChange).toHaveBeenCalledWith({ elsewhere: 'compact' });

    rerender(
      <VariantsProvider enabled selection={{ elsewhere: 'compact' }}>
        <Card label="a" />
      </VariantsProvider>
    );
    expect(panel.getByRole('button', { hidden: true, name: 'Reset' })).toBeDisabled();
  });

  it('offers a search once there are many groups', async () => {
    const few = ['alpha', 'bravo', 'charlie', 'delta', 'echo'].map(defineCard);
    const { rerender } = render(
      <VariantsProvider enabled>
        {few.map((Group) => (
          <Group key={Group.variantsId} label="x" />
        ))}
      </VariantsProvider>
    );
    const panel = await findPanel();
    expect(panel.queryByRole('searchbox', { hidden: true })).not.toBeInTheDocument();

    const many = [...few, defineCard('foxtrot')];
    rerender(
      <VariantsProvider enabled>
        {many.map((Group) => (
          <Group key={Group.variantsId} label="x" />
        ))}
      </VariantsProvider>
    );
    const search = await vi.waitFor(() =>
      panel.getByRole('searchbox', { hidden: true, name: 'Search groups' })
    );

    fireEvent.change(search, { target: { value: 'CHAR' } });
    expect(panel.getAllByRole('combobox', { hidden: true })).toHaveLength(1);
    expect(panel.getByRole('combobox', { hidden: true, name: 'charlie' })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'nothing like it' } });
    expect(panel.queryByRole('combobox', { hidden: true })).not.toBeInTheDocument();
    expect(panel.getByText('No groups match.')).toBeInTheDocument();
  });

  it('points out a variant that failed', async () => {
    const consoleError = vi.mocked(console.error).mockImplementation(() => undefined);
    function BrokenCard(): never {
      throw new Error('Broken variant');
    }
    const Card = variants('card', {
      default: DefaultCard,
      broken: () => Promise.resolve({ default: BrokenCard }),
    });
    render(
      <VariantsProvider enabled>
        <Card label="a" />
      </VariantsProvider>
    );

    await pick('card', 'broken');

    const panel = await findPanel();
    expect(
      await panel.findByText('Failed, showing the default. See the console.')
    ).toBeInTheDocument();
    expect(screen.getAllByText('default a').at(-1)).toBeVisible();
    consoleError.mockReset();
  });

  it('reports two groups that share an id', async () => {
    const consoleError = vi.mocked(console.error).mockImplementation(() => undefined);
    const First = defineCard('card');
    const Second = defineCard('card');
    render(
      <VariantsProvider enabled>
        <First label="a" />
        <Second label="b" />
        <Second label="c" />
      </VariantsProvider>
    );

    const panel = await findPanel();

    expect(panel.getAllByRole('combobox', { hidden: true })).toHaveLength(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      '[variantlab] Two different variants() groups use the id "card". Selections refer to groups by id, so give each group its own.'
    );
    consoleError.mockReset();
  });
});
