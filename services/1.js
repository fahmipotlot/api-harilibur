import puppeteer from 'puppeteer-extra'
// import pluginStealth from 'puppeteer-extra-plugin-stealth'

(async () => {
    let headless = true;
    const browser = await puppeteer.launch({headless});
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
  
    await page.goto('https://publicholidays.co.id/id/2024-dates/');
    // await page.goto('https://www.g2.com/');
    await page.screenshot({path: 'out.png'});
  
    const html = await page.content();
    await browser.close();
    console.log(html);
})();