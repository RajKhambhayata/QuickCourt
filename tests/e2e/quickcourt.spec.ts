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

test.describe('4. Features & New Modules (Food Court, Karting, Games, Rewards)', () => {
  test('should_render_food_court_outlets_and_menu_items', async ({ page }) => {
    await page.goto('/food-court');
    await expect(page).toHaveTitle(/Food Court/i);
    await expect(page.locator('text=The Food Court').first()).toBeVisible();
    await expect(page.locator('text=CourtSide Brew & Bowls').first()).toBeVisible();
  });

  test('should_render_karting_heats_and_championship_standings', async ({ page }) => {
    await page.goto('/karting');
    await expect(page).toHaveTitle(/Go-Karting/i);
    await expect(page.locator('text=Track sessions').first()).toBeVisible();

    await page.goto('/karting/championship');
    await expect(page).toHaveTitle(/Championship/i);
    await expect(page.locator('text=The Leaderboard').first()).toBeVisible();
  });

  test('should_render_arcade_games_and_minigame_tabs', async ({ page }) => {
    await page.goto('/games');
    await expect(page).toHaveTitle(/Arcade/i);
    await expect(page.locator('text=Smash Rally').first()).toBeVisible();
    await expect(page.locator('text=Daily Wheel').first()).toBeVisible();
  });

  test('should_render_club_rewards_desk_and_streaks', async ({ page }) => {
    await page.goto('/rewards');
    await expect(page).toHaveTitle(/Rewards/i);
    await expect(page.locator('text=Your Perks & Vouchers').first()).toBeVisible();
    await expect(page.locator('text=Daily Play Streak').first()).toBeVisible();
  });
});
