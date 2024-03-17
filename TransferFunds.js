require('dotenv').config(); // load password and username in a secure way
const { chromium } = require('playwright');
const { expect } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        // login page
        await page.goto('https://parabank.parasoft.com/parabank/index.htm');
        // Get Username and Password
        const username = process.env.PARABANK_USERNAME;
        const password = process.env.PARABANK_PASSWORD;
        if (!username || !password) {
            console.error('Username or password environment variable is not set.');
            return;
        }
        // Login
        await page.fill('#loginPanel > form > div:nth-child(2) > input', username);
        await page.fill('#loginPanel > form > div:nth-child(4) > input', password);
        await Promise.all([
            page.click('#loginPanel > form > div:nth-child(5) > input'),
        ]);
        // Check login success
        if (page.url().includes('overview.htm')) {
            console.log('Login successful');
        } else {
            console.log('Login failed');
            return;
        }
        // Navigate to Transfer Funds page
        await page.click('#leftPanel > ul > li:nth-child(3) > a');
        // transfer funds
        const fromAccount = '14343';
        const toAccount = '14454';
        const amount = '1';
        await page.selectOption('#fromAccountId', fromAccount);
        await page.selectOption('#toAccountId', toAccount);
        await page.fill('#amount', amount);
        await page.click('#rightPanel > div > div > form > div:nth-child(4) > input');
        const response = await page.waitForResponse(response => response.url().includes('transfer') && response.status() === 200);
        // Validate transfer success
        if (!response.ok()) {
            throw new Error('Transfer failed');
        }
        if (response.ok()) {
            console.log('Transfer successful');
        }
        const logoutLink = page.locator('a[href="/parabank/logout.htm"]');
        // Logout
        await Promise.all([
            logoutLink.click(),
        ]);
        // Confirm logout
        await expect(page.locator('#loginPanel')).toBeVisible();
        console.log("Logout successful");
    } 
    catch (error) 
    {
        console.error('Error during the automation:', error);
    } 
    finally 
    {
        await browser.close();
    }
})();

