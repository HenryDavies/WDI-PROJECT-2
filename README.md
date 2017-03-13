# PropertEase

<img width="1440" alt="screen shot 2017-03-13 at 13 04 10" src="https://cloud.githubusercontent.com/assets/22742327/23855465/a901b652-07ed-11e7-972e-851c1bf390b8.png">

## Overview

PropertEase is a property map that makes property searches easier. It was created as my second project for a 12-week Web Development Immersive course at General Assembly in London. It was built using a MEN stack (MongoDB, Express, Node).

See it here: [PropertEase](https://propert-ease.herokuapp.com/).

## The problem

House searches are hard. Getting a good deal on a house requires in-depth knowledge of the local property market. The average Joe doesn't have this. While he can acquire this knowledge, it is extremely time consuming and difficult.

I was once this average Joe. I set out to educate myself on the property market by maintaining and updating an excel spreadsheet. My goal was to find a property at an attractive valuation and in a convenient location. I therefore recorded the price per square foot and subjective comments on location for every property put on the market within my search parameters.

As well as being an arduous task - due to the huge number of listings posted per day and largely manual labour - there were two main problems:

- Square foot data is hard to come by. On Zoopla, only ~15% of listed properties show the square foot data on the listing page. Most properties have floor plans with the square foot listed on them, but these floor plans are not always linked to on the website
- Subjective comments on location, made by eyeing up the map, are of limited use. For example, a property may be right next to a tube station yet still be a nightmare commute to wherever one works. Likewise, a property may seem way outside one's search area but actually offer a short commute due to favourable train links

## The solution

PropertEase is hugely improved (and automated) version of my spreadsheet, presented in a clean, map-based format. It offers the following:

- A map showing all the latest Zoopla property listings in London. The user can choose to see between 50 and 250 properties at one time, and click through to instantly see all of the rest of the >10,000 listings
- The user's search can be filtered by location (and specified search radius), number of bedrooms and price range
- **Over 80% of the listings have square foot data** (and the calculated price per square foot), which shows when one clicks on a property marker. This compares to only 15% on the Zoopla website
- The map also shows **the commute time to the user's work**. The commute details are drawn on the map

## How it works

#### Property database

##### Zoopla API
- The property listings come from the Zoopla API
- Zoopla offers a wide range of useful fields for each listing. I saved 15 fields into my database, including price & location details, descriptions and links to images
- While the Zoopla API does not provide the square foot data, it does provide a URL to the floorplan whenever it is available
- Sometimes a new listing will be an update of a previous listing. When this happens, I move the price(s) and date(s) from the old version of the listing to a history field in the new listing before deleting the old version from the database

##### Acquisition of square foot data
- **The first 15%**: I scrape the square foot data for the 15% of listings that show the data on the main Zoopla URL. Given that the square foot data is always in the same place in the HTML, this is a relatively simple exercise
- **The rest of the listings**: Acquiring the rest of the square foot data involves parsing the text off floor plans using the Google Cloud Vision API. The process is as follows:
	- Save all of the floor plans available (excluding the 15%)
	- Parse the text off them with the Google Cloud Vision API
	- Look for all variations of square foot - 25 variations used (e.g. 'SQ FT', 'SA-FT')
	- Find the maximum square foot number by splitting the text by each spelling of square foot (after making several adjustments to the text e.g. removing thousand separators and several other characters)
	- Remove outliers: floor plans often appear antiquated, as if they have been scanned and faxed several times. Because of this, the text parser is not perfect. Luckily, mistakes are often adding or missing a digit, which leads to square foot data that is wildly off. I deal with these mistakes by excluding i) properties with a square footage under 250 or above 5000, and ii) properties with a price per square foot below 300 or above 1700.
 	- Save square foot data to listings

#### Showing the properties and commute on the map
- The map is from the Google Maps API
- The default listings shown are the latest 50 listings uploaded onto Zoopla (as of the latest data download)
- The search works using the *array.filter* method on the data received from the API request to the database. The search location provided is converted into a latitude and longitude using the Google Geocoding API. A circle is drawn with the specified radius, and properties are filtered by comparing the distance to the center with the radius of the circle. The other filters (price range & bedrooms) are straightforward
- Commute directions are shown on the map when one clicks on a property, again coming from the Google Maps API
- An info window is attached to each listing marker showing an image, price, number of bedrooms, short description, square foot, price per square foot, and commute time

## Key challenges/learnings

My biggest challenge was in getting the Google Cloud Vision API to work. The API can only take a certain amount of requests at one time, otherwise throwing up errors. To get around this, I throttled the requests using the *eachLimit* method of the *async* module. It took me some time to realise that I had to change the number of requests allowed at one time based upon the speed of my internet connection - what initially worked on campus didn't work at home, and what worked at home didn't work at home if my housemate was watching Netflix.

Increasing my database up to the full 10,000 listings downloadable from Zoopla threw up more errors - this time relating to stack overflow. I fixed this by splitting the seeding processes into four different files, as well as more throttling.

Downloading the full 10,000 listings was a time-consuming process due to API limits from Zoopla (1000 listings per hour). Two failed overnight attempts helped me realise the importance of proper error handling.

## Further work

I believe there is significant value in the data gathered in this project. Mining the data over time would provide bottom-up price and valuation trends, which I do not believe is easily available anywhere else. The trend data would also provide interesting insights on how many properties are being sold, or how many prices are being reduced, versus historical averages. Finally, the data could be split in different ways - one potentially useful example would be to work out the average price per square foot for each post code in London.
