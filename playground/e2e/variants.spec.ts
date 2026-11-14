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

async function selectVariant(page: Page, groupId: string, name: string) {
  const group = page.getByRole('radiogroup', { name: groupId });
  // The radio itself is visually hidden, so click its label like a person would.
  await group.getByText(name, { exact: true }).click();
  await expect(group.getByRole('radio', { name })).toBeChecked();
}

function visibleCards(page: Page) {
  return page.locator('article[data-variant]:visible');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the default variants while the gate is closed', async ({ page }) => {
  await selectVariant(page, 'pricing-card', 'compact');
  await expect(page.locator('article[data-variant="compact"]:visible')).toHaveCount(3);

  await page.getByRole('switch', { name: 'Gate open' }).uncheck();

  await expect(page.locator('article[data-variant="default"]:visible')).toHaveCount(3);
  await expect(visibleCards(page)).toHaveCount(3);
});

test('loads a variant chunk only once the variant is selected', async ({ page }) => {
  const chunkRequests: string[] = [];
  page.on('request', (request) => {
    if (/PricingCard\.compact-[\w-]+\.js$/.test(request.url())) chunkRequests.push(request.url());
  });
  await expect(page.locator('article[data-variant="default"]:visible')).toHaveCount(3);
  expect(chunkRequests).toEqual([]);

  await selectVariant(page, 'pricing-card', 'compact');

  await expect(page.locator('article[data-variant="compact"]:visible')).toHaveCount(3);
  await expect(visibleCards(page)).toHaveCount(3);
  expect(chunkRequests).toHaveLength(1);
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

  await expect
    .poll(() => consoleProblems.some((problem) => problem.includes('failed to render')))
    .toBe(true);
  await expect(signup).toHaveAttribute('data-variant', 'default');
  await expect(signup.getByRole('button', { name: 'Start your trial' })).toBeVisible();
  expect(consoleProblems.join('\n')).toContain(
    '[variantlab] Variant "broken" of "signup-cta" failed to render. Showing the default variant instead.'
  );
  consoleProblems.length = 0;
});
