import playwright from 'playwright';
import fs from 'fs';
import { promisify } from 'util';

async function appendToCSV(filename:string, data:string) {
    // Convert fs functions to Promise-based
    const writeFileAsync = promisify(fs.writeFile);
    const readFileAsync = promisify(fs.readFile);

    try {
        // Read existing CSV content
        let existingData = await readFileAsync(filename, 'utf8');
        
        // Append new data
        existingData += data + '\n'; // Assuming data is a string representing a CSV row
        
        // Write back to the file
        await writeFileAsync(filename, existingData);
        
        console.log('Data appended to CSV successfully.');
    } catch (err) {
        console.error('Error appending data to CSV:', err);
    }
}

export default async function checkAvailableDates(){
    let newMonthAvailable = false;
    let monthTotalDays =[31,28,31,30,31,30,31,31,30,31,30,31]
    const browser = await playwright.chromium.launch({
        headless: true,//true == no ui
    })
    const page = await browser.newPage();
    await page.goto('https://hawspets.givecloud.co/dog-park');
    
    //get rid of the modal
    await page.getByRole('button', { name: 'Close' }).click();

    let month = new Date().getMonth()
    //will always be 25th
    let monthRemainingDays = monthTotalDays[month] - 25;
    let nextMonthDays = monthTotalDays[month+1] + monthRemainingDays;
    // console.log(monthRemainingDays)

    //there are 2 extra cards to donate to haws so we subtract that
    let availableDays = (await page.locator('.product-grid-item').count()) - 2;
    // console.log(availableDays)
    
    if(monthRemainingDays === availableDays){
        console.log('new month not added')

    }else if(monthRemainingDays < availableDays && availableDays === nextMonthDays + monthRemainingDays ){
        console.log('new days')
        newMonthAvailable = true;
    }
  
    const filename = './logs/data_over_time.csv';
    const newData = `${new Date()},${newMonthAvailable}`; // Example CSV row to append

    // console.log(newData)
    await appendToCSV(filename, newData);

}
