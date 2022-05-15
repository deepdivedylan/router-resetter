import 'dotenv/config';
import puppeteer from 'puppeteer';

const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://' + process.env.ROUTER_IP);
};