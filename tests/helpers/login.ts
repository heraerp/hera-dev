import { Page, expect } from '@playwright/test';

// Login credentials - centralized for easy management
export const TEST_USER = {
  email: 'santhoshlal@gmail.com',
  password: 'test123'
} as const;

// Login URLs and selectors
const LOGIN_URL = 'http://localhost:3002/login';
const EMAIL_SELECTOR = 'input#email, input[name="email"]';
const PASSWORD_SELECTOR = 'input#password, input[name="password"]';
const SUBMIT_BUTTON_SELECTOR = 'button[type="submit"]';

// Success indicators after login
const SUCCESS_INDICATORS = [
  'text=Dashboard',
  'button:has-text("Logout")',
  'button:has-text("Sign Out")',
  '[data-testid="logout-button"]',
  'nav', // Navigation menu typically appears after login
  'a[href="/dashboard"]'
];

/**
 * Performs login with the test user credentials
 * @param page - Playwright page object
 * @param options - Optional configuration for login behavior
 * @returns Promise that resolves when login is complete
 */
export async function login(
  page: Page,
  options: {
    waitForNavigation?: boolean;
    timeout?: number;
    expectSuccess?: boolean;
  } = {}
): Promise<void> {
  const {
    waitForNavigation = true,
    timeout = 30000,
    expectSuccess = true
  } = options;

  console.log('🔐 Starting login process...');

  // Navigate to login page if not already there
  if (!page.url().includes(LOGIN_URL)) {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle', { timeout });
  }

  // Fill in email
  console.log('📧 Filling email field...');
  await page.fill(EMAIL_SELECTOR, TEST_USER.email);

  // Fill in password
  console.log('🔑 Filling password field...');
  await page.fill(PASSWORD_SELECTOR, TEST_USER.password);

  // Click submit button
  console.log('🚀 Submitting login form...');
  
  if (waitForNavigation) {
    // Wait for navigation after clicking submit
    await Promise.all([
      page.waitForNavigation({ 
        waitUntil: 'networkidle',
        timeout 
      }),
      page.click(SUBMIT_BUTTON_SELECTOR)
    ]);
  } else {
    await page.click(SUBMIT_BUTTON_SELECTOR);
  }

  // Wait for successful login if expected
  if (expectSuccess) {
    console.log('✅ Verifying successful login...');
    await verifyLoginSuccess(page, timeout);
  }
}

/**
 * Verifies that login was successful by checking for expected elements
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait for success indicators
 */
export async function verifyLoginSuccess(page: Page, timeout: number = 30000): Promise<void> {
  // Check that we're no longer on the login page
  await expect(page).not.toHaveURL(/.*\/login.*/, { timeout });

  // Look for any success indicator
  let successFound = false;
  const errors: string[] = [];

  for (const selector of SUCCESS_INDICATORS) {
    try {
      await page.waitForSelector(selector, { 
        timeout: 5000,
        state: 'visible'
      });
      console.log(`✅ Found success indicator: ${selector}`);
      successFound = true;
      break;
    } catch (error) {
      errors.push(`${selector}: not found`);
    }
  }

  if (!successFound) {
    console.error('❌ No success indicators found:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(
      'Login verification failed. Could not find any success indicators.\n' +
      'Checked for: ' + SUCCESS_INDICATORS.join(', ')
    );
  }
}

/**
 * Checks if the user is currently logged in
 * @param page - Playwright page object
 * @returns Promise<boolean> - true if logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check if we're on a login page
    if (page.url().includes('/login')) {
      return false;
    }

    // Look for any logged-in indicator
    for (const selector of SUCCESS_INDICATORS) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          return true;
        }
      } catch (error) {
        // Continue checking other selectors
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Ensures user is logged in before running tests
 * If not logged in, performs login
 * @param page - Playwright page object
 */
export async function ensureLoggedIn(page: Page): Promise<void> {
  const loggedIn = await isLoggedIn(page);
  
  if (!loggedIn) {
    console.log('🔄 User not logged in, performing login...');
    await login(page);
  } else {
    console.log('✅ User already logged in');
  }
}

/**
 * Logs out the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  console.log('🚪 Logging out...');
  
  const logoutSelectors = [
    'button:has-text("Logout")',
    'button:has-text("Sign Out")',
    '[data-testid="logout-button"]',
    'a:has-text("Logout")',
    'a:has-text("Sign Out")'
  ];

  let loggedOut = false;
  
  for (const selector of logoutSelectors) {
    try {
      await page.click(selector);
      await page.waitForURL(/.*\/login.*/, { timeout: 10000 });
      console.log('✅ Successfully logged out');
      loggedOut = true;
      break;
    } catch (error) {
      // Try next selector
    }
  }

  if (!loggedOut) {
    console.warn('⚠️ Could not find logout button, navigating directly to login page');
    await page.goto('http://localhost:3002/login');
  }
}

/**
 * Helper to wait for Supabase auth to be ready
 * @param page - Playwright page object
 */
export async function waitForSupabaseAuth(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      // Check if Supabase client is initialized
      return (window as any).supabase !== undefined;
    },
    { timeout: 10000 }
  );
}

/**
 * Gets the current session from Supabase
 * @param page - Playwright page object
 * @returns The current session object or null
 */
export async function getSupabaseSession(page: Page): Promise<any> {
  return await page.evaluate(async () => {
    const supabase = (window as any).supabase;
    if (!supabase) return null;
    
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });
}