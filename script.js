const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const notfoundSection = document.querySelector(".not-found");
const searchcitySection = document.querySelector(".search-city");
const weatherinfoSection = document.querySelector(".weather-info");
const apiKey = "2ba67baa77afe86b520c1afcd5cfabd8"

const countryTxt = document.querySelector(".country-txt")
const tempTxt = document.querySelector(".temp-txt")
const conditionTxt = document.querySelector(".condition-txt")
const humidityTxt = document.querySelector(".humidity-value-txt")
const windValueTxt = document.querySelector(".wind-value-txt")
const weatherSummaryImg = document.querySelector(".weather-summary-img")
const currentDataTxt = document.querySelector(".current-date-txt")

const forecastItemContainer = document.querySelector(".forecast-items-container")

searchBtn.addEventListener("click", () => {
    if(cityInput.value.trim() != ''){

        updateWeatherInfo(cityInput.value)
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener("keydown", (event) => {
    if(event.key == 'Enter' && cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value)
        cityInput.value = '';
        cityInput.blur();
    }
})

async function getFetchData(endPoint, city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (err) {
        console.error("Fetch failed: ", err);
        return { cod: 500 }; 
    }
}

function getWeatherIcon(id){
    if(id <= 232) return 'thunderstorm.svg'
    if(id <= 321) return 'drizzle.svg'
    if(id <= 531) return 'rain.svg'
    if(id <= 622) return 'snow.svg'
    if(id <= 781) return 'atmosphere.svg'
    if(id <= 800) return 'clear.svg'
    else return 'clouds.svg'
    
}

 function getCurrentDate() {
    const date = new Date()
    console.log(date)
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        
    }
    return date.toLocaleDateString('en-GB', options)
}

async function updateWeatherInfo(city)
{
    const weatherData = await getFetchData('weather', city);
    if(weatherData.cod != 200){
        showDisplaySection(notfoundSection)
        return
    }
    

    const {
        name: country,
        main: {temp , humidity},
        weather: [{id, main}],
        wind: {speed}

    } = weatherData

    countryTxt.innerText = country
    tempTxt.innerText = Math.round(temp) + '°C'
    conditionTxt.innerText = main
    humidityTxt.innerText = humidity + '%'
    windValueTxt.innerText = speed + 'm/s'
    currentDataTxt.innerText = getCurrentDate()
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`



    await updateForecastsInfo(city)

    showDisplaySection(weatherinfoSection)
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemContainer.innerHTML = '';

    const dateMap = new Map();

    
    forecastsData.list.forEach(forecast => {
        const [date, time] = forecast.dt_txt.split(' ');

        if (date === todayDate) return; 

        if (!dateMap.has(date)) {
            dateMap.set(date, []);
        }

        dateMap.get(date).push({ forecast, time });
    });

    
    const targetTime = "12:00:00";
    let count = 0;

    for (let [date, entries] of dateMap.entries()) {
        if (count >= 5) break;

        
        entries.sort((a, b) => {
            const t1 = Math.abs(parseInt(a.time.split(':')[0]) - 12);
            const t2 = Math.abs(parseInt(b.time.split(':')[0]) - 12);
            return t1 - t2;
        });

        updateForecastItems(entries[0].forecast);
        count++;
    }
}

function updateForecastItems(weatherData){
   
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}

        } = weatherData

        const dateTaken = new Date(date)
        const dateOption = {
            day: '2-digit',
            month: 'short'
        }
        const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

        const forecastItem = `
                    <div class="forecast-item">
                        <h5 class="forecast-item-date regular-txt" >${dateResult}</h5>
                        <img src="assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
                        <h5 class="forecast-item-temp">${Math.round(temp)}&deg;c</h5>
                    </div>
        `
        forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem)
}




function showDisplaySection(section) {
    [weatherinfoSection, searchcitySection, notfoundSection]
         .forEach(section => section.style.display = 'none')

        section.style.display = 'block'
}
