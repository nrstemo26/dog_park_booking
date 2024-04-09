import playwright from 'playwright'

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
    //so now we can loop thru
    //get all dates
    //probably use nth(4)


    // let allDays = await page.locator('.product-grid-item').allInnerTexts()
    // console.log(allDays)

    // okay can I get
    // get every card because i need to: 
    // see if its sold out
    // get the date and the view day to click and find time zones available

    //product-grid-item
    //get every card
    //check for sold out text
    //if it doesn't ahve sold out text
    //then check what time slots it has?

    // await page.locator('div').filter({ hasText: 'SOLD OUT SCA Private Dog Park | April 10 Dog Park $20.00 Add to Cart View' }).nth(3).click();
    // await page.locator('div:nth-child(2) > .product-grid-item > div > .card-flags > .flag-secondary').click();

    //get rid of popup
    //modal-content 
    //aria-label "Close"
    // await page.locator('modal-content close').click()
    // await page.locator('modal-content close').getByRole('button',{name:''})
    //get all product-grid-item

    //get sold out banner

    console.log('done scraping')
}

async function run(){
    await scrapePark('https://hawspets.givecloud.co/dog-park')
}

run();