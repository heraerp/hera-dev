import { test as setup } from '@playwright/test';
import { login } from './helpers/login';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await login(page);
  
  // Save storage state
  await page.context().storageState({ path: authFile });
  
  console.log('✅ Authentication state saved to:', authFile);
});