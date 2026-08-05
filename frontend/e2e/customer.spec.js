import { test, expect } from '@playwright/test';

test.describe('Customer CRUD', () => {
  test('create, edit, and delete a customer', async ({ page }) => {
    const name = `Customer ${Date.now()}`;
    const updatedName = `${name} (updated)`;

    await page.goto('/');

    const section = page.locator('.card').filter({ hasText: 'Customers' });

    await section.getByLabel('Name').fill(name);
    await section.getByLabel('Available amount').fill('100');
    await section.getByRole('button', { name: 'Add customer' }).click();

    const initialRow = section.locator('tbody tr').filter({ hasText: name });
    await expect(initialRow).toBeVisible();
    await expect(initialRow.locator('td').nth(2)).toHaveText('100');

    const id = await initialRow.locator('td').first().innerText();
    const row = section.locator('tbody tr').filter({
      has: page.locator('td', { hasText: new RegExp(`^${id}$`) }),
    });

    await row.getByRole('button', { name: 'Edit' }).click();
    await row.locator('input').first().fill(updatedName);
    await row.getByRole('button', { name: 'Save' }).click();

    await expect(row.locator('td').nth(1)).toHaveText(updatedName);

    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(section.locator('tbody tr').filter({ hasText: updatedName })).toHaveCount(0);
  });
});
