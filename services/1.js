import puppeteer from 'puppeteer-extra'
import userAgent from 'user-agents';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
// import pluginStealth from 'puppeteer-extra-plugin-stealth'

(async () => {
    let headless = true;
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({headless});
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString())
    await page.setJavaScriptEnabled(true);
  
    await page.goto('https://publicholidays.co.id/id/2024-dates/');
    // await page.goto('https://www.g2.com/');
    await page.screenshot({path: 'out.png'});
  
    const html = await page.content();
    await browser.close();
    console.log(html);
})();