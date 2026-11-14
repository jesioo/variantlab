import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Every test fails on console errors, warnings, or uncaught page errors it did not expect.
// A test that expects some takes them out of `consoleProblems` after asserting on them.
const test = base.extend<{ consoleProblems: string[] }>({
  consoleProblems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') {
          problems.push(message.text());
        }
      });
      page.on('pageerror', (error) => {
        problems.push(error.message);
      });
      await use(problems);
      expect(problems).toEqual([]);
    },
    { auto: true },
  ],
});

function launcher(page: Page) {
  return page.getByRole('button', { name: /^Variants/ });
}

function panel(page: Page) {
  return page.getByRole('dialog', { name: 'Variants' });
}

async function openPanel(page: Page) {
  if (await panel(page).isVisible()) return;
  await launcher(page).click();
  await expect(panel(page)).toBeVisible();
}

async function selectVariant(page: Page, groupId: string, name: string) {
  await openPanel(page);
  const picker = panel(page).getByRole('combobox', { name: groupId });
  await picker.selectOption(name);
  await expect(picker).toHaveValue(name);
}

function visibleCards(page: Page) {
  return page.locator('article[data-variant]:visible');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the default variants and hides the panel while the gate is closed', async ({
  page,
}) => {
  await selectVariant(page, 'pricing-card', 'compact');
  await expect(page.locator('article[data-variant="compact"]:visible')).toHaveCount(3);

  await page.getByRole('switch', { name: 'Gate open' }).uncheck();

  await expect(page.locator('article[data-variant="default"]:visible')).toHaveCount(3);
  await expect(visibleCards(page)).toHaveCount(3);
  await expect(launcher(page)).toHaveCount(0);
});

test('fetches variant chunks only once the panel opens', async ({ page }) => {
  const chunkRequests: string[] = [];
  page.on('request', (request) => {
    const chunk = /\/(\w+\.\w+)-[\w-]+\.js$/.exec(request.url())?.[1];
    if (chunk !== undefined && /\.(compact|spotlight|inline|broken)$/.test(chunk)) {
      chunkRequests.push(chunk);
    }
  });
  await expect(launcher(page)).toBeVisible();
  expect(chunkRequests).toEqual([]);

  await openPanel(page);

  await expect
    .poll(() => chunkRequests.toSorted())
    .toEqual([
      'PricingCard.compact',
      'PricingCard.spotlight',
      'SignupCta.broken',
      'SignupCta.inline',
    ]);
  await selectVariant(page, 'pricing-card', 'compact');
  await expect(page.locator('article[data-variant="compact"]:visible')).toHaveCount(3);
  await expect(visibleCards(page)).toHaveCount(3);
  expect(chunkRequests).toHaveLength(4);
});

test('keeps the state of a variant when flipping back to it', async ({ page }) => {
  const team = page.getByRole('article', { name: 'Team' });
  await team.getByRole('button', { name: 'Add a seat to Team' }).click();
  await team.getByRole('button', { name: 'Add a seat to Team' }).click();
  await expect(team.getByRole('status', { name: 'Team seats' })).toHaveText('5');

  await selectVariant(page, 'pricing-card', 'spotlight');
  await expect(team).toHaveAttribute('data-variant', 'spotlight');
  await expect(team.getByRole('status', { name: 'Team seats' })).toHaveText('3');

  await selectVariant(page, 'pricing-card', 'default');
  await expect(team).toHaveAttribute('data-variant', 'default');
  await expect(team.getByRole('status', { name: 'Team seats' })).toHaveText('5');
});

test('renders the default variant in place of a variant that throws', async ({
  page,
  consoleProblems,
}) => {
  const signup = page.getByRole('region', { name: 'Sign up' });

  await selectVariant(page, 'signup-cta', 'broken');

  await expect(
    panel(page).getByText('Failed, showing the default. See the console.')
  ).toBeVisible();
  await expect(signup).toHaveAttribute('data-variant', 'default');
  await expect(signup.getByRole('button', { name: 'Start your trial' })).toBeVisible();
  expect(consoleProblems.join('\n')).toContain(
    '[variantlab] Variant "broken" of "signup-cta" failed to render. Showing the default variant instead.'
  );
  consoleProblems.length = 0;
});

test('marks the launcher while variants are changed and resets them', async ({ page }) => {
  await expect(launcher(page)).toHaveAccessibleName('Variants');

  await selectVariant(page, 'pricing-card', 'compact');
  await selectVariant(page, 'signup-cta', 'inline');
  await expect(launcher(page)).toHaveAccessibleName('Variants, 2 changed');

  await panel(page).getByRole('button', { name: 'Reset' }).click();

  await expect(launcher(page)).toHaveAccessibleName('Variants');
  await expect(page.locator('article[data-variant="default"]:visible')).toHaveCount(3);
  await expect(page.getByRole('region', { name: 'Sign up' })).toHaveAttribute(
    'data-variant',
    'default'
  );
  await expect(panel(page).getByRole('button', { name: 'Reset' })).toBeDisabled();
});

test('closes like a popover', async ({ page }) => {
  await openPanel(page);
  await expect(panel(page).getByRole('combobox', { name: 'pricing-card' })).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
  await expect(launcher(page)).toBeFocused();

  await openPanel(page);
  await page.getByRole('heading', { name: 'Plans that grow with your team' }).click();
  await expect(panel(page)).toBeHidden();

  await openPanel(page);
  await launcher(page).click();
  await expect(panel(page)).toBeHidden();
});

test('works from the keyboard', async ({ page }) => {
  await launcher(page).focus();
  await page.keyboard.press('Enter');
  await expect(panel(page)).toBeVisible();

  const pricing = panel(page).getByRole('combobox', { name: 'pricing-card' });
  await expect(pricing).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel(page).getByRole('combobox', { name: 'signup-cta' })).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(panel(page)).toBeHidden();
  await expect(launcher(page)).toBeFocused();
});
