import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER_ERROR:', msg.text());
        } else {
            console.log('BROWSER_LOG:', msg.text());
        }
    });
    
    page.on('pageerror', error => {
        console.log('BROWSER_PAGE_ERROR:', error.message);
    });
    
    console.log("Navigating to http://localhost:5173 ...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log("Waiting 2s for React to mount...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Done checking.");
    await browser.close();
  } catch(e) {
    console.log('SCRIPT_ERROR', e);
  }
})();
