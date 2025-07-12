//cities into dropdown options

const csv = `latitude,longitude,city,country
    52.367,4.904,Amsterdam,Netherlands
    39.933,32.859,Ankara,Turkey
    56.134,12.945,Åstorp,Sweden
    37.983,23.727,Athens,Greece
    54.597,-5.930,Belfast,Northern Ireland
    41.387,2.168,Barcelona,Spain
    52.520,13.405,Berlin,Germany
    46.948,7.447,Bern,Switzerland
    43.263,-2.935,Bilbao,Spain
    50.847,4.357,Brussels,Belgium
    47.497,19.040,Bucharest,Romania
    59.329,18.068,Budapest,Hungary
    51.483,-3.168,Cardiff,Wales
    50.937,6.96,Cologne,Germany
    55.676,12.568,Copenhagen,Denmark
    51.898,-8.475,Cork,Ireland
    53.349,-6.260,Dublin,Ireland
    55.953,-3.188,Edinburgh,Scotland
    43.7696,11.255,Florence,Italy
    50.110,8.682,Frankfurt,Germany        
    43.254,6.637,French Riviera,France
    32.650,-16.908,Funchal,Portugual
    36.140,-5.353,Gibraltar
    57.708,11.974,Gothenburg,Sweden     
    53.548,9.987,Hamburg,Germany
    60.169,24.938,Helsinki,Finland
    39.020,1.482,Ibiza,Spain
    50.450,30.523,Kyiv,Ukraine
    61.115,10.466,Lillehammer,Norway
    38.722,-9.139,Lisbon,Portugual
    51.507,-0.127,London,England      
    40.416,-3.703,Madrid,Spain
    39.695,3.017,Mallorca,Spain
    53.480,-2.242,Manchester,England       
    43.296,5.369,Marseille,France
    27.760,-15.586,Maspalomas,Spain
    45.464,9.190,Milan,Italy
    48.135,11.582,Munich,Germany
    40.851,14.268,Naples,Italy
    43.034,-2.417,Oñati,Spain
    59.913,10.752,Oslo,Norway
    48.856,2.352,Paris,France
    50.075,14.437,Prague,Czech Republic
    64.146,-21.942,Reykjavík,Iceland
    56.879,24.603,Riga,Latvia
    41.902,12.496,Rome,Italy
    39.453,-31.127,Santa Cruz das Flores,Portugual
    28.463,-16.251,Santa Cruz de Tenerife,Spain
    57.273,-6.215,Skye,Scotland
    42.697,23.321,Sofia,Bulgaria
    59.329,18.068,Stockholm,Sweden
    59.437,24.753,Tallinn,Estonia
    18.208,16.373,Vienna,Austria
    52.229,21.012,Warsaw,Poland
    53.961,-1.07,York,England
    47.376,8.541,Zurich,Switzerland
    `;

const lines = csv.trim().split('\n');
lines.shift();

const cities = lines.map(line => {
    const [lat, lon, city, country] = line.split(',');
    return { lat: parseFloat(lat), lon: parseFloat(lon), city, country };
});

const select = document.getElementById('city-select');

// Generate option for each city
cities.forEach(({ city, country }) => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = `${city} (${country})`;
    select.appendChild(option);
});



//city selection to trigger api call

select.addEventListener('change', () => {
  const selectedCity = select.value;
  if (!selectedCity) return;

  const cityData = cities.find(c => c.city === selectedCity);
  if (!cityData) return alert('City data not found.');

  fetchWeather(cityData.lat, cityData.lon);
});


//fetch weather from 7timer api
async function fetchWeather(lat, lon) {
  const url = 'https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();

    displayWeather(data.dataseries);
  } catch (error) {
    console.error('Fetch error:', error);
    alert('Failed to load weather data.');
  }
}









//generate HTML for weather

function displayWeather(dataseries) {
  const container = document.querySelector('.weather-container');
  container.innerHTML = ''; // clear old cards

  dataseries.forEach((day, index) => {


    const iconName = mapWeatherToIcon(day.weather);
    const CustomWeather= mapWeatherToSimple(day.weather);
    const html = `
      <div class="bg-blue-100 rounded-md flex justify-center items-center flex-col p-5 gap-3 text-lg">
        <h4>${formatDate(day.date)}</h4>
        <div><img src="/EuroOrbit/tree/main/images/${iconName}.png" alt="${day.weather}"></div>
        <h5>${day.weather}</h5>
        <div>
          <h5>LT: ${day.temp2m.min} °C</h5>
          <h5>HT: ${day.temp2m.max} °C</h5>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}


//weather title to simple one
function mapWeatherToSimple(weather){
    const map = {
        clear: 'Clear',
        pcloudy: 'Partly Cloudy',
        mcloudy: 'Cloudy',
        cloudy: 'Very Cloudy',
        rain: 'Rainy',
        lightrain: 'Light Rain',
        oshower: 'Occasional showers',
        ishower: 'Isolated showers',
        ts: 'Thunderstorm',
        snow: 'Snow',
        rainsnow: 'Mixed',

    };
    return map[weather] || 'clear';
}

// Simple weather icon mapping
function mapWeatherToIcon(weather) {
  const map = {
    clear: 'clear',
    pcloudy: 'pcloudy',
    mcloudy: 'mcloudy',
    cloudy: 'cloudy',
    rain: 'rain',
    lightrain: 'lightrain',
    oshower: 'ishower',
    ishower: 'ishower',
    ts: 'tstorm',
    snow: 'snow',
    rainsnow: 'rainsnow',
  };
  return map[weather] || 'clear';
}

function formatDate(apiDate) {
  const dateStr = apiDate.toString();
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1; // Months are 0-indexed
  const day = parseInt(dateStr.slice(6, 8));

  const date = new Date(year, month, day);
  const options = { day: 'numeric', month: 'long' }; // "7 July"
  return date.toLocaleDateString('en-US', options);
}
