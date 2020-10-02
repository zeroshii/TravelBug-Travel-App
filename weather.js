const currentDay = moment().format('L');
var rapidAPIHeaders = {
    "x-rapidapi-host": "trueway-places.p.rapidapi.com",
    "x-rapidapi-key": "bd4b60f585mshb932ee3918ef8d1p1f6ceajsn5f0b0da033ac"
};
var apiKey = "e854039facmshf240de781c376e5p1fdb86jsn66c280925862";
var WeatherAPIKey = "555f0f1cc17650cb7069ee6104be4ed1";
var userInput = document.getElementById("search-Input");
var searchButton = document.getElementById("searchButton");
var searchHistory = getSearchHistory();

//This function is initiated by clicking the search button that takes user input.
function searchCity(event) {
    event.preventDefault();
    var input = userInput.value;
    if (!input || input == "") return;
    addToSearchHistory(input);
    createListItem(input);
    getweatherdata(input);
}

function addToSearchHistory(cityName) {
    searchHistory.push(cityName);
    localStorage.searchHistory = JSON.stringify(searchHistory);
}

function getSearchHistory() {
    return JSON.parse(localStorage.searchHistory || "[]");
}

function createSidebarFromHistory() {
    getweatherdata(searchHistory[searchHistory.length-1]);
    searchHistory.forEach(createListItem);
}

function createListItem(cityName) {
    var node = document.createElement("li");
    node.setAttribute("class", "list-group-item");
    var textnode = document.createTextNode(cityName);
    node.appendChild(textnode);
    node.addEventListener("click", function () {
		handleSideBarOnClick(cityName);
	});
    document.querySelector(".cities").appendChild(node);
}

function handleSideBarOnClick(name) {
	getweatherdata(name);
}

function getweatherdata(name) {
    var forecastqueryURL = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + name + "&APPID=" + WeatherAPIKey;
    $('.weather').empty();
    $.ajax({
        url: forecastqueryURL,
        method: "GET"
    })
    .then(function (response) {
        console.log(response);
        $('.city').text(response.city.name);
        getNearbyPlaces(response.city.coord.lat, response.city.coord.lon);
        for (var i = 0; i < 5; i++) {
            let forecastIndex = ((i + 1) * 8) - 5; // to get the midday index of each day
            let forecast = response.list[forecastIndex];
            let forecastDate = moment(currentDay, "L")
                .add((i + 1), 'days')
                .format('L');


            $(`
            <div class="col-weather-day">
                <div class="card portfolioCard">
                  <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" class="card-image" style="margin: 0 10px;">
                  <div class="card-body">
                    <h5 class="card-title">${forecastDate}</h5>
                    <p class="card-temp">Temperature:${forecast.main.temp}&#186 F</p>
                  </div>
                </div>
              </div>  
            `).appendTo('.weather');
        }

    });
}

function getNearbyPlaces(lat, lon) {  
    $.ajax({
        "url": `https://trueway-places.p.rapidapi.com/FindPlacesNearby?type=tourist_attraction&radius=5000&language=en&location=${lat},${lon}`,
        "async": true,
        "crossDomain": true,
        "method": "GET",
        "headers": rapidAPIHeaders
    }).done(function (response) {
        console.log(response);
        const attractions = response.results;
        attractions.forEach(function(attraction) {
            $(`            
                <div class="col-sm-6">
                    <div class="card portfolioCard">
                        <div class="card-body">
                            <h5 class="card-title">${attraction.name}</h5>
                            <p class="card-text">Address: ${attraction.address}</p>
                            <p class="rating"> Phonenumber: ${attraction.phone_number || "N/A"}</p>
                            <p>Type: ${attraction.types.join(', ')}</p>
                            <a target="_new" href="${attraction.website}" class="btn btn-primary link">Attraction Link</a>
                        </div>
                    </div>
                </div>
            `).appendTo('.attractions');
        })
    });
}


createSidebarFromHistory();

searchButton.addEventListener("click", searchCity);
