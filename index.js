import puppeteer from 'puppeteer';
import fs from 'fs';

const targetUrl = 'https://varzeshtv.ir/Conductor';

async function scrapeTableToCSV() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: false,
            protocolTimeout: 120000
        });
        const page = await browser.newPage();
        
        page.setDefaultNavigationTimeout(120000);
        page.setDefaultTimeout(120000);

        await page.goto(targetUrl);
        await page.waitForSelector('.table', { timeout: 120000 });

        const tableData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr.vertical-middle'));
            return rows.map(row => {
                return {
                    title: row.querySelector('h5.titlecls')?.textContent?.trim() || '',
                    description: row.querySelector('span.extracls')?.textContent?.trim() || '',
                    time: row.querySelector('td.vertical-middle > div')?.textContent?.trim() || '',
                    duration: row.querySelector('.conductor-archive-page--duration div')?.textContent?.trim() || '',
                    imageUrl: row.querySelector('td.program-image img')?.src || ''
                };
            });
        });

        // Create CSV content with new column order
        const csvHeader = 'Title,Description,Time,Duration,Image URL\n';
        const csvRows = tableData.map(item => 
            `"${item.title}","${item.description}","${item.time}","${item.duration}","${item.imageUrl}"`
        ).join('\n');
        
        const csvContent = csvHeader + csvRows;

        await fs.promises.writeFile('programs.csv', csvContent, 'utf8');
        console.log('CSV file saved successfully: programs.csv');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

scrapeTableToCSV();