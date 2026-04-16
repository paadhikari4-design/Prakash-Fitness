const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    
    page.on('pageerror', err => {
      console.log('---PAGE_ERROR---');
      console.log(err.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('---CONSOLE_ERROR---');
        console.log(msg.text());
      }
    });

    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
    
    console.log('Success, evaluating DOM...');
    const body = await page.evaluate(() => document.body.innerHTML);
    if (body.includes('Error Boundaries')) {
        console.log('Found an Error boundary render:', body.substring(0, 500));
    }
    
    await browser.close();
  } catch (err) {
    console.error('Script Failed:', err);
  }
})();
