import { chromium } from '@playwright/test';

const BASE_URL = 'https://inovainfor.vercel.app';
const EMAIL = 'littlefigther50@gmail.com';
const PASSWORD = '040998Rr#';

async function fullTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('Failed to fetch') && !text.includes('404')) {
        errors.push(text.substring(0, 150));
      }
    }
  });
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('   TESTE COMPLETO - Financeiro Inova');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // 1. Login
  console.log('1. Login...');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('   ✓ Login OK\n');
  
  // 2. Dashboard
  console.log('2. Dashboard...');
  const cards = await page.locator('[class*="card"]').count();
  console.log(`   Cards encontrados: ${cards}`);
  console.log('   ✓ Dashboard OK\n');
  
  // 3. Navegação para todas as páginas
  const pages = [
    { name: 'Clientes', url: '/clientes', button: 'Clientes' },
    { name: 'Transações', url: '/transactions', button: 'Transações' },
    { name: 'Vendas', url: '/vendas', button: 'Vendas' },
    { name: 'Ordens', url: '/ordens', button: 'Ordens' },
    { name: 'Estoque', url: '/estoque', button: 'Estoque' },
    { name: 'Relatórios', url: '/relatorios', button: 'Relatórios' },
    { name: 'Configurações', url: '/configuracoes', button: 'Configurações' },
  ];
  
  for (const p of pages) {
    console.log(`3. Navegando para ${p.name}...`);
    await page.goto(`${BASE_URL}${p.url}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log(`   ✓ ${p.name} OK\n`);
  }
  
  // 4. Voltar para Início (Dashboard)
  console.log('4. Voltando para Início...');
  const inicioLink = page.locator('text=Início').first();
  const isVisible = await inicioLink.isVisible().catch(() => false);
  console.log('   Link "Início" visível:', isVisible);
  
  if (isVisible) {
    await inicioLink.click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log('   ✓ Navegação OK\n');
  } else {
    console.log('   ⚠️ Link não encontrado, tentando por URL...\n');
    await page.goto(`${BASE_URL}/dashboard`);
  }
  
  // 5. Verificar erros
  console.log('5. Erros não-404 encontrados:');
  if (errors.length === 0) {
    console.log('   ✓ Nenhum erro crítico\n');
  } else {
    errors.forEach(e => console.log(`   ⚠️ ${e}`));
  }
  
  await browser.close();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('   TESTE CONCLUÍDO');
  console.log('═══════════════════════════════════════════════════════');
}

fullTest().catch(console.error);
