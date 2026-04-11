import { chromium } from '@playwright/test';

const BASE_URL = 'https://inovainfor.vercel.app';

async function simpleTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Acessando site...');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  console.log('2. Verificando se há login...');
  const url = page.url();
  console.log('   URL atual:', url);
  
  // Verificar se precisa de login
  const loginForm = await page.locator('input[type="email"], input[type="text"]').first().isVisible().catch(() => false);
  console.log('   Login form visível:', loginForm);
  
  if (loginForm) {
    console.log('3. Fazendo login...');
    await page.fill('input[type="email"], input[type="text"]', 'littlefigther50@gmail.com');
    await page.fill('input[type="password"]', '040998Rr#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('   URL após login:', page.url());
  }
  
  console.log('4. Verificando estado da página...');
  
  // Capturar tela
  await page.screenshot({ path: 'test-results/simple-test.png' });
  console.log('   Screenshot salvo em test-results/simple-test.png');
  
  // Verificar modais
  const modals = await page.locator('[role="dialog"], .fixed.inset-0').count();
  console.log('   Número de modais/overlays:', modals);
  
  // Verificar se há backdrop
  const backdrop = await page.locator('.bg-bg-dark\\/90, .bg-black\\/50').count();
  console.log('   Número de backdrops:', backdrop);
  
  // Listar classes dos elementos fixed
  const fixedElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('.fixed, .absolute');
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      classes: el.className,
      zIndex: getComputedStyle(el).zIndex
    })).filter(el => el.zIndex && parseInt(el.zIndex) > 50);
  });
  console.log('   Elementos com z-index > 50:', fixedElements.length);
  
  await browser.close();
  console.log('\n✓ Teste concluído');
}

simpleTest().catch(console.error);
