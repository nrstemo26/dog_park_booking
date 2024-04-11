import playwright from 'playwright'
import 'dotenv/config'

let timeSlotArr = ['8:00-8:45AM','9:00-9:45AM','10:00-10:45AM','11:00-11:45AM','3:00-3:45PM','4:00-4:45PM','5:00-5:45PM','6:00-6:45PM','7:00-7:45PM']
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
    let days:any = []
    
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
                // index: i,
                url: await page.locator('.product-grid-item .feature-image').nth(i).getAttribute('href')
            })
        }
        
    }

    console.log(days)
    // console.log(days)
    for(let i = 0; i< days.length; i++){
        let day = days[i];
        if(!day.sold_out){
            let times = await scrapeTimes(day.url)
            days[i] = {
                ...days[i],
                times
            }
        }
    }

    console.log(days)
    console.log('done scraping')
    return days;
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

async function scrapeTimes(url:string|null):Promise<any>{
    console.log('scraping times,')
    if(url){
    const browser = await playwright.chromium.launch({
        headless: true,//true == no ui
    })
    const page = await browser.newPage();
    await page.goto(url);

    //get rid of pop up modal
    await page.getByRole('button', { name: 'Close' }).click();

    //gets all of the available timeslots
    let times = cleanTimes(await page.locator('.product-add-to-cart .product-options .custom-control .custom-control-label').allInnerTexts())

    browser.close()
    return times;


    }
    throw new Error('expected a url and there was none');
    return 'err';
}

async function bookParkDay(url:string, date:string, time:string):Promise<void>{
    const email = process.env.EMAIL || 'foo';
    const password = process.env.PASSWORD||'bar';
    const address = process.env.ADDRESS || 'baz';

    const browser = await playwright.chromium.launch({
        headless: false,//true == no ui
    })
    const page = await browser.newPage();
    await page.goto(url);

    //get rid of pop up modal
    await page.getByRole('button', { name: 'Close' }).click();
  
    //clicks time slot
    console.log(time)
    await page.getByText(time).click();

    if(await page.getByText(time).isChecked()){
        // on first page
        //clicks and fills # of dogs
        await page.getByLabel('Number of Dogs Playing*').fill('3');
    
        //accepting terms
        await page.locator('#p3922-f28618-container div').click();
        await page.getByText('By submitting payment, I').click();
    
    
        await page.getByRole('button', { name: ' Add to Cart' }).click();
        await page.getByRole('link', { name: 'Continue to Payment ' }).click();
        
        //this is a new page
        await page.getByRole('button', { name: 'Checkout ' }).click();

        //own page
        // await page.locator('#inputLoginEmail').click()
        await page.locator('#inputLoginEmail').fill(email)
        // await page.locator('#inputLoginPassword').click()
        await page.locator('#inputLoginPassword').fill(password)
        await page.getByRole('button', { name: 'Login ' }).click();

    
        await page.getByRole('button',{name:'Next'}).click();

        //address and user details page
        await page.waitForTimeout(3000);
        await page.locator('#inputBillingAddress1').fill(address)
        await page.locator('.pac-container .pac-item').click();
        await page.getByRole('button',{name:'Next'}).click();

    }
    

    //click time slot
    //click on # of dogs and fill to 3
    //agree to terms and other btn
    //add to cart

    //go to cart

}

async function run(){
//    await scrapeTimes('https://hawspets.givecloud.co/product/SCADPAPR222024/sca-private-dog-park-april-22')
    let desired = [
        {
            date: 'April 21',
            time: '7:00-7:45PM'
        },
        {
            date: 'April 25',
            time: '7:00-7:45PM'
        },
        {
            date: 'April 30',
            time: '7:00-7:45PM'
        },
    ]

    let parkData = await scrapePark('https://hawspets.givecloud.co/dog-park');


    //check booking
    for(let i = 0; i < desired.length; i++){
        let desiredDay = desired[i];
        for(let j = 0; j < parkData.length; j++){
            let day = parkData[j];
            if(!day.sold_out && day.date === desiredDay.date){
                if(!day.times[desiredDay.time].booked){
                    console.log('made it in here')
                    console.log(day) 
                    try{
                        //actually go in and book that shit  
                        await bookParkDay(day.url, desiredDay.date, desiredDay.time)
                        

                    }catch(e){
                        break;
                    }

                }

            }
        }
    }
}

// run();

bookParkDay('https://hawspets.givecloud.co/product/SCADPAPR252024/sca-private-dog-park-april-25','April 25', '7:00-7:45')


//todos
//add the times to the array of dates
//figure out how to actually book the shit
//how to book with an array of days?