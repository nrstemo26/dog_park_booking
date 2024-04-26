import playwright from 'playwright'
import 'dotenv/config'
import checkAvailableDates from './checkAvailableDates'
import readline from 'readline/promises';
import dayjs from 'dayjs';
// checkAvailableDates()

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
    const card_cvv = process.env.CARD_CVV||'foo';
    const card_expiry = process.env.CARD_EXP||'foo';
    const card_number = process.env.CARD_NUM||'foo';

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

        //on card details page out page
        //can either preset card details or do this
        await page.locator('#inputPaymentNumber').fill(card_number);
        await page.locator('#inputPaymentExpiry').fill(card_expiry);
        await page.locator('#inputPaymentCVV').fill(card_cvv);
        //not a robot
        // await page.locator('#recaptcha-anchor-label').click()
        //confirm payment
        // await page.locator('#btn-pay').click()

    }
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

async function getUserMonth(){
    function makeCalendar(start, end, offset){
        let dayStr = ''

        for(let i = 0; i<offset; i++){
            dayStr += 'xx || '
        }
        for(let i = start; i <= end; i++){
            let el:string = i.toString() + ' ||';
            if(i< 10){
                el = ' ' + el;
            }
            if((i - offset -1) % 7 == 0) {

                el += '\n'
            }else{
                el += ' '
            }
            dayStr += el;
        }
        return dayStr;
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    let currentMonthDays = '';
    let nextMonthDays = '';
    let now = dayjs();
    let nowOffset = now.day();

    let nextMonth = dayjs().month(now.month()+1)
    let firstOfNextMonth = nextMonth.date(1)
    let nextMonthOffset = firstOfNextMonth.day();


    // offset days based on day of week
    //

    // console.log(months[nextMonth.month()])
    // console.log(nextMonth.daysInMonth())

    currentMonthDays =  makeCalendar(now.date(), now.daysInMonth(), nowOffset)
    nextMonthDays =  makeCalendar(1, nextMonth.daysInMonth(), nextMonthOffset)

    console.log(months[now.month()])
    console.log(`Su || Mo || Tu || We || Th || Fr || Sa ||`)
    console.log(currentMonthDays)
    console.log(months[nextMonth.month()])
    console.log('Su || Mo || Tu || We || Th || Fr || Sa ||')
    console.log(nextMonthDays)
}

async function getUserInput(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    // let days = Number(await rl.question('How many days do you want to book at the park? '))
    // console.log(`${days} to book`)

    getUserMonth()
    // let now = dayjs();
    // console.log(dayjs().month(now.month()).daysInMonth())
    // for(let i=0; i<days; i++){
        //ask month


        //ask day of month
        //ask time

    // }

    // rl.question('What is your name? ',(answer)=>{
    //     console.log(`hello, ${answer}!`);

    //     rl.close();
    // } )
}
getUserInput();






// run();

// bookParkDay('https://hawspets.givecloud.co/product/SCADPAPR252024/sca-private-dog-park-april-25','April 25', '7:00-7:45')


//have it book just one
//have it watch to check when it acutally uploads the new dates
//have it check every 10 minutes on the 25th of every month then log some shit
//then have it book multiple