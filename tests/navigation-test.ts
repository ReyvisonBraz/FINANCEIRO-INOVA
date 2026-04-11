import { chromium } from '@playwright/test';

const BASE_URL = 'https://inovainfor.vercel.app';

async function testNavigation() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Setup console monitoring
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('   ⚠️ Console error:', msg.text().substring(0, 100));
    }
  });
  
  console.log('1. Login...');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[type="text"]', 'littlefigther50@gmail.com');
  await page.fill('input[type="password"]', '040998Rr#');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('   ✓ Logado\n');
  
  const pages = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Clientes', url: '/clientes' },
    { name: 'Transações', url: '/transactions' },
    { name: 'Vendas', url: '/vendas' },
    { name: 'Ordens', url: '/ordens' },
    { name: 'Estoque', url: '/estoque' },
    { name: 'Relatórios', url: '/relatorios' },
    { name: 'Configurações', url: '/configuracoes' },
  ];
  
  for (const p of pages) {
    console.log(`2. Navegando para ${p.name}...`);
    await page.goto(`${BASE_URL}${p.url}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const backdrop = await page.locator('.bg-bg-dark\\/90, .bg-black\\/50').count();
    const dialogs = await page.locator('[role="dialog"]').count();
    console.log(`   URL: ${page.url()}`);
    console.log(`   Backdrops: ${backdrop}, Dialogs: ${dialogs}`);
    
    if (backdrop > 0 || dialogs > 0) {
      console.log('   ⚠️ MODAL DETECTADO! Salvando screenshot...');
      await page.screenshot({ path: `test-results/${p.name.replace(/\s/g, '_')}.png` });
      break;
    }
    console.log('   ✓ OK\n');
  }
  
  // Tentar clicar em Dashboard via sidebar
  console.log('3. Tentando clicar em Dashboard...');
  const dashboardLink = page.locator('text=Dashboard').first();
  const isVisible = await dashboardLink.isVisible().catch(() => false);
  console.log('   Dashboard link visível:', isVisible);
  
  if (isVisible) {
    await dashboardLink.click();
    await page.waitForTimeout(1000);
    console.log('   URL após clique:', page.url());
  }
  
  await browser.close();
  console.log('\n✓ Teste concluído');
}

testNavigation().catch(console.error);
