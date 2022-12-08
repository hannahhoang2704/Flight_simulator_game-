'use strict';

//start game page_ index.html

const search = document.getElementById('start');                //button to fetch all the airports in chosen city
const city = document.getElementById('city');                   //input of city
const div_ICAO = document.getElementById('ICAO-fetch')          //div contain all the ICAO element
const ICAO_p = document.createElement('p');                     //Message to player after choose the city

//game status update
const nameUpdate = document.getElementById('player-name');
const giftsUpdate = document.getElementById('gifts');
const currentco2Update = document.getElementById('consumed');


//airport weather
const temperature = document.getElementById('airport-temp');
const weatherCondition = document.getElementById('airport-conditions');
const windSpeed = document.getElementById('airport-wind');
const weatherIcon = document.getElementById('weather-icon');


let departureAirport;                   //departure airport name
let icao_start;                       //ICAO of the depature airport
const icao_rovaniemi = 'EFRO';               //ICAO of Rovaniemi
let currentAirport =" ";
let currentAirport_long;
let currentAirport_lat;




//Add maps

let map;

function drawMapWithMarker(pos, icao) {
  // Use the leaflet.js library to show the location on the map (https://leafletjs.com/)
  // first the map itself if it has not been created before
  if (map == null) {
    map = L.map('map')
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }
  map.setView(pos, 13);

  // then the marker
  L.marker(pos).addTo(map).bindPopup(icao).openPopup();
}

// function to update the game status
function updateGameStatus(screen_name,gifts,currentco2) {
  nameUpdate.innerText = `PLayer name: ${screen_name}`;
  giftsUpdate.innerText = gifts
  currentco2Update.innerText = currentco2
}

//function to update the weather in HTML
function updateWeather(temp, condition, wind, icon){
  temperature.innerHTML = `<span>${temp}°C</span>`;
  weatherCondition.innerHTML = `<span>${condition}</span>`;
  windSpeed.innerHTML = `<span>${wind} m/s</span>`;
  weatherIcon.src = 'https://openweathermap.org/img/wn/' + str(icon) +'@2x.png';
}


//fetch the airport info(ICAO, name, long, lat) where you want to flight to
async function getAirportPosition(icao){
  try {

          const userName = document.querySelector('#user-name').value;
          document.getElementById('welcome').innerText = `Hi ${userName}, let's start your journey!`;
          const response = await fetch('http://127.0.0.1:5100/gamerinfo?name=' +userName + '&location=' + icao);    // starting data download, fetch returns a promise which contains an object of type 'response'
          const jsonData = await response.json();          // retrieving the data retrieved from the response object using the json() function
          const pos = [jsonData.airport.Lat, jsonData.airport.Long];                                  // create position array for leaflet library
          console.log(jsonData);     // log the result to the console
          console.log(jsonData.airport.Name, jsonData.airport.Lat, jsonData.airport.Long )
          // Show the airport name to the screen

          currentAirport = jsonData.airport.Name;

          console.log('current airport: ' + currentAirport);
          currentAirport_lat = jsonData.airport.Lat;
          currentAirport_long = jsonData.airport.Long;

          //console.log('Latitude: ' + currentAirport_lat)
          //console.log('Longitude: ' + currentAirport_long)

          //Add current airport name in Airport name h2
          const airportUpdateName = document.getElementById('airport-name');
          airportUpdateName.innerHTML = `<span>${currentAirport}</span>`;

          //update player name,gifts and current co2
          const screen_name = jsonData.screen_name;
          const gifts = jsonData.gifts;
          const currentco2 = jsonData.co2_consumed;
          updateGameStatus(screen_name,gifts,currentco2)

          // and draw the map
          drawMapWithMarker(pos, icao)


          //fetch weather
          const responseWeather = await fetch('http://127.0.0.1:5100/weather?lat=' + currentAirport_lat + '&long=' + currentAirport_long);    // starting data download, fetch returns a promise which contains an object of type 'response'
          const jsonDataWeather = await responseWeather.json();
          console.log(jsonDataWeather)
          updateWeather(jsonDataWeather.temperature, jsonDataWeather.description,jsonDataWeather.wind, jsonDataWeather.icon)

      } catch (error) {
          console.log(error.message);
      } finally {                                         // finally = this is executed anyway, whether the execution was successful or not
          console.log('asynchronous load complete');
      }
  }


//get distance between 2 airport
async function getAirportDistance(icao_start, icao_end) {
    let jsonData;
    try {
        const response = await fetch('http://127.0.0.1:3000/airportdistance?start=' + icao_start + '&end=' + icao_end);    // starting data download, fetch returns a promise which contains an object of type 'response'
        jsonData = await response.json();          // retrieving the data retrieved from the response object using the json() function
        //drawMapWithLine(jsonData.start, jsonData.end)
        console.log(jsonData.dist);     // log the result to the console
    } catch (error) {
        console.log(error.message);
    } finally {                                         // finally = this is executed anyway, whether the execution was successful or not
        return jsonData.dist;
    }
}



//Check how far from departure airport to Rovaniemi
function airport_start(evt) {
  evt.preventDefault();
  const selectOption = document.getElementById('airport-fetch');          //get the ICAO number of the chosen airport
  icao_start = selectOption.options[selectOption.selectedIndex].value;
  //console.log(icao_start);
  let start_btn = document.createElement('button');  // Start button
  start_btn.innerText = 'Start';
  start_btn.addEventListener('click',function(){
    alert('Hello');
  })
  document.getElementById('main-program').appendChild(start_btn)

  getAirportPosition(icao_start);                                                  //fetch the departure airport info
  //getAirportPosition(icao_rovaniemi);                                               //fetch the info of Rovaniemi airport
  //airport_route_distance();             //check distance between departure airport to Rovaniemi airport
}


//print in console the distance between departure airport to rovaniemi airport
  function airport_route_distance() {
    getAirportDistance(icao_start, icao_rovaniemi).then(function(distance) {
      console.log('Distance = ' + distance + 'km')
    })
  }



//All the airports are listed after player choose the city
  function airportOptions(jsonData) {
    ICAO_p.innerText = 'List of airports:';                                 //Make a dropdrown list of depature airports
    div_ICAO.appendChild(ICAO_p);
    const select = document.createElement('select');
    select.setAttribute('id', 'airport-fetch')
    div_ICAO.appendChild(select)
    for (let i = 0; i < jsonData.length; i++) {
      const airport_options = document.createElement('option');
      airport_options.setAttribute('value', `${jsonData[i]['ICAO']}`);
      airport_options.appendChild(document.createTextNode(`${jsonData[i]['Airport name']}`));
      select.appendChild(airport_options);
    }
    const button_airport = document.createElement('button');      //Button to choose the departure airport
    button_airport.appendChild(document.createTextNode('Take off!'));
    button_airport.setAttribute('id', 'button-airport');

    div_ICAO.appendChild(button_airport);

////////////////post method to get ICAO of airport to flask server!!!!

    button_airport.addEventListener('click', airport_start)           //click button to choose the departure airport
  }



//fetch all the airports in the chosen city
  function fetch_airport(evt) {
    evt.preventDefault();
    airportFetches();
  }

  async function airportFetches() {                 // asynchronous function is defined by the async keyword
    div_ICAO.innerHTML = "";                        //empty the select option of game
    //console.log('asynchronous download begins');
    try {                                               // error handling: try/catch/finally
      console.log(city.value);
      const response = await fetch('http://127.0.0.1:5100/' + city.value);    // starting data download, fetch returns a promise which contains an object of type 'response'
      const jsonData = await response.json();          // retrieving the data retrieved from the response object using the json() function
      console.log(jsonData[0]['Airport name']);

      airportOptions(jsonData);
    } catch (error) {
      console.log(error.message);
      ICAO_p.innerText = `City can not found! Choose another city.`;        //inform the city is not in database
      div_ICAO.appendChild(ICAO_p);

    } finally {                                         // finally = this is executed anyway, whether the execution was successful or not
      //console.log('asynchronous load complete');
    }
  }


//call-back function to fetch all airport in chosen city
search.addEventListener('click', fetch_airport);
