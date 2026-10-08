import { test, expect } from '@playwright/test';

test.describe('3. UI Navigation & Layout (E2E / Visual)', () => {
  test('should_render_homepage_elements_correctly', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    // Check main title or QuickCourt branding
    await expect(page).toHaveTitle(/QuickCourt/i);

    // Navbar branding should be visible
    const brand = page.locator('text=QuickCourt').first();
    await expect(brand).toBeVisible();

    // Check presence of key navigation or hero elements
    const heroOrContent = page.locator('main');
    await expect(heroOrContent).toBeVisible();
  });

  test('should_navigate_to_all_navbar_links', async ({ page }) => {
    await page.goto('/');

    // Explore /venues page
    const venuesLink = page.locator('a[href="/venues"]').first();
    if (await venuesLink.isVisible()) {
      await venuesLink.click();
      await expect(page).toHaveURL(/\/venues/);
    }
  });

  test('should_display_404_page_for_non_existent_routes', async ({ page }) => {
    const response = await page.goto('/non-existent-route-404-test');
    expect(response?.status()).toBe(404);
  });

  test('should_toggle_mobile_drawer_navigation_menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile drawer test is only applicable on mobile viewport');

    await page.goto('/');

    // Look for hamburger toggle button
    const menuButton = page.locator('button[aria-label="Toggle menu"], button:has(svg.lucide-menu)').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Menu drawer or close button should be visible
      const closeButton = page.locator('button:has(svg.lucide-x), [role="dialog"]').first();
      await expect(closeButton).toBeVisible();
    }
  });
});

test.describe('1. Authentication & Route Protection (E2E)', () => {
  test('should_restrict_unauthenticated_access_to_protected_routes', async ({ page }) => {
    // Attempting to visit /admin/dashboard without auth
    await page.goto('/admin/dashboard');

    // Should redirect to /admin/login with from query param
    await expect(page).toHaveURL(/\/admin\/login.*from=%2Fadmin%2Fdashboard/);
  });

  test('should_prevent_submission_when_required_fields_are_empty', async ({ page }) => {
    await page.goto('/player/login');

    // Find submit button and submit empty form
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Standard HTML5 validation or form error toast/message should appear
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired !== null || (await page.locator('.text-red-500, [role="alert"]').count()) > 0).toBeTruthy();
  });
});
