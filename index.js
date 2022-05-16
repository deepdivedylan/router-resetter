import { exec } from 'child-process-promise';
import 'dotenv/config';
import puppeteer from 'puppeteer';

const restartRouter = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://' + process.env.ROUTER_IP);
    await page.waitForNavigation();

    // event to accept the javascript alert to reboot the router
    page.on('dialog', async dialog => {
        await dialog.accept();
    });

    // sign in
    await page.click('#user_name');
    await page.keyboard.type(process.env.ROUTER_USERNAME);
    await page.click('#loginpp');
    await page.keyboard.type(process.env.ROUTER_PASSWORD);
    await page.click('#login_btn');
    await page.waitForNavigation();

    // click "Management"
    const management = '#first_menu_manage';
    await page.waitForSelector(management);
    await page.click(management);

    // click "Device Management
    const deviceManagement = 'ul.sec-menu li span[onclick*="menuLeft.changeSecMenu(this,\\"manage\\",1)"]';
    await page.waitForSelector(deviceManagement);
    await page.click(deviceManagement);

    // click "Device Reboot"
    const deviceReboot = 'ul.sec-menu ul.thr-menu.thr-menu-open li[onclick*="menuLeft.changeThrMenu(this,2)"]';
    await page.waitForSelector(deviceReboot);
    await page.click(deviceReboot);

    // click "Reboot" in a pesky iframe
    const iframe = 'iframe[src="reboot.html"]';
    const reboot = '#Restart_button';
    await page.waitForSelector(iframe);
    console.log(page.mainFrame().childFrames());
    for (const frame of page.mainFrame().childFrames()) {
        if (frame.url().endsWith('/html/reboot.html')) {
            await frame.waitForSelector(reboot);
            await frame.click(reboot);
            break;
        }
    }

    await browser.close();
};

const speedTest = async () => {
    const command = await exec('speedtest-cli --json');
    const tooSlow = parseInt(process.env.ROUTER_TOOSLOW);
    const result = JSON.parse(command.stdout);
    return result.download < tooSlow;
};

const shouldReset = await speedTest();
if (shouldReset) {
    await restartRouter();
}