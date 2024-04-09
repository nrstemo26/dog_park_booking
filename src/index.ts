import playwright from 'playwright'

let timeSlots = {
    '8:00-8:45AM':{
        available: false
    },
    '9:00-9:45AM':{
        available: false
    },
    '10:00-10:45AM':{
        available: false
    },
    '11:00-11:45AM':{
        available: false
    },
    '3:00-3:45PM':{
        available: false
    },
    '4:00-4:45PM':{
        available: false
    },
    '5:00-5:45PM':{
        available: false
    },
    '6:00-6:45PM':{
        available: false
    },
    '7:00-7:45PM':{
        available: false
    },
 }


// npx playwright codegen https://hawspets.givecloud.co/dog-park
async function scrapePark(url:string){ 
    let days = []
    
    const browser = await playwright.chromium.launch({
        headless: true,//true == no ui
    })
    const page = await browser.newPage();
    await page.goto(url);
    
    //get rid of pop up modal
    await page.getByRole('button', { name: 'Close' }).click();

    let soldOutArr = await page.locator('.product-grid-item .card-flags').allInnerTexts()
    let dateArr = await page.locator('.product-grid-item .card-title').allInnerTexts()
    
    let cardCount = await page.locator('.product-grid-item').count()
    

    for(let i = 0; i<cardCount; i++){
        let date;
        
        if(dateArr[i].includes('|')){
            date = dateArr[i].split('|')[1].trim();
        }

        if(date){
            days.push({
                sold_out: soldOutArr[i].trim() === "SOLD OUT"? true: false,
                date: date,
                index: i,
                url: await page.locator('.product-grid-item .feature-image').nth(i).getAttribute('href')
            })
        }
        
    }

    console.log(days)
    let daysTimes = days.forEach(async ({ sold_out, date, index, url }) => {
        if(!sold_out){
            // await scrapeTimes(url)
            //function to scrape times from website
        }
    })

    console.log('done scraping')
}
function cleanTimes(arr:string[]){
    let slot:any= {}
    arr.map((el:string)=>{
        const [timeRange, status] = el.split('\n\n'); // Splitting the string into time range and status
        const isBooked = status.includes('(Booked)'); // Checking if the status includes '(Booked)'
        const formattedTimeRange = timeRange.replace(/\s+/g, ''); // Removing whitespace from the time range
        slot[formattedTimeRange] = { booked: isBooked };
    })
    return slot
}

async function scrapeTimes(url:string|null):Promise<number[]>{
    if(url){
    const browser = await playwright.chromium.launch({
        headless: true,//true == no ui
    })
    const page = await browser.newPage();
    await page.goto(url);

    //get rid of pop up modal
    await page.getByRole('button', { name: 'Close' }).click();

    //so what do we need?
    //get all of the available dates

    console.log(await page.locator('.product-add-to-cart .product-options .custom-control .custom-control-label').allInnerTexts())

//   await page.getByText('7:00-7:45 PM $').click();
//   await page.getByRole('button', { name: ' Add to Cart' }).click();
//   await page.getByLabel('Number of Dogs Playing*').click();
//   await page.getByLabel('Number of Dogs Playing*').fill('3');

    //.product-add-to-cart
    //.product-options.product-options-list 
    //.custom-control //.custom-radio
        //type radio .custom-control-input
        //.custom-control-label  text gets us the time
        //we can click on this to check the radio box
    //we will need the radio button
    //we will need the checkout button    

    }
    return [2,4,6,7]
}

async function run(){
//    await scrapeTimes('https://hawspets.givecloud.co/product/SCADPAPR222024/sca-private-dog-park-april-22')
    // await scrapePark('https://hawspets.givecloud.co/dog-park')
}

run();
console.log(cleanTimes([
    '8:00-8:45 AM\n\n$20.00 (Booked)',
    '9:00-9:45 AM\n\n$20.00 (Booked)',
    '10:00 AM - 10:45AM\n\n$20.00 (Booked)',
    '11:00 - 11:45 AM\n\n$20.00 (Booked)',
    '3:00PM-3:45 PM\n\n$20.00 (Booked)',
    '4:00-4:45 PM\n\n$20.00 (Booked)',
    '5:00-5:45 PM\n\n$20.00 (Booked)',
    '6:00-6:45 PM\n\n$20.00 (Booked)',
    '7:00-7:45 PM\n\n$20.00'
  ]))