const API_KEY = "YOUR_API_KEY";


const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");
const unitBtn = document.getElementById("unitBtn");

const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const weatherBox = document.getElementById("weather");
const historyBox = document.getElementById("history");

// ================= TEMPERATURE =================

let currentTempC = 0;
let currentTempF = 0;
let isCelsius = true;

// ================= LOADER =================

function showLoader() {

    loader.classList.remove("hidden");
    weatherBox.classList.add("hidden");
    errorBox.classList.add("hidden");

}

function hideLoader() {

    loader.classList.add("hidden");

}

// ================= ERROR =================

function showError(message) {

    errorBox.textContent = message;
    errorBox.classList.remove("hidden");

}

// ================= SEARCH =================

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");
        return;

    }

    getWeather(city);

});

cityInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});

// ================= CURRENT LOCATION =================

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        showError("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            getWeather(`${lat},${lon}`);

        },

        () => {

            showError("Unable to get your location.");

        }

    );

});

// ================= WEATHER =================

async function getWeather(location) {

    showLoader();

    try {

        const response = await fetch(

            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3&aqi=yes&alerts=yes`

        );

        if (!response.ok) {

            throw new Error("City not found.");

        }

        const data = await response.json();

        hideLoader();

        weatherBox.classList.remove("hidden");

        saveHistory(data.location.name);

        displayWeather(data);

    }

    catch (error) {

        hideLoader();

        showError(error.message);

    }

}

/*=========================================
        DISPLAY WEATHER
=========================================*/

function displayWeather(data) {

    // ================= CITY =================

    document.getElementById("cityName").textContent =
        data.location.name;

    document.getElementById("country").textContent =
        data.location.country;

    document.getElementById("localTime").textContent =
        data.location.localtime;

    // ================= ICON =================

    document.getElementById("icon").src =
        "https:" + data.current.condition.icon;

    // ================= TEMPERATURE =================

    currentTempC = data.current.temp_c;
    currentTempF = data.current.temp_f;

    document.getElementById("temperature").textContent =
        currentTempC + "°C";

    // ================= CONDITION =================

    document.getElementById("condition").textContent =
        data.current.condition.text;

    // ================= DETAILS =================

    document.getElementById("feels").textContent =
        data.current.feelslike_c + "°C";

    document.getElementById("humidity").textContent =
        data.current.humidity + "%";

    document.getElementById("wind").textContent =
        data.current.wind_kph + " km/h";

    document.getElementById("visibility").textContent =
        data.current.vis_km + " km";

    // ================= SUN =================

    document.getElementById("sunrise").textContent =
        data.forecast.forecastday[0].astro.sunrise;

    document.getElementById("sunset").textContent =
        data.forecast.forecastday[0].astro.sunset;

    // ================= AQI =================

    const aqi = data.current.air_quality["us-epa-index"];

    let status = "";
    let message = "";

    switch (aqi) {

        case 1:
            status = "🟢 Good";
            message = "Air quality is good. Enjoy your outdoor activities.";
            break;

        case 2:
            status = "🟡 Moderate";
            message = "Air quality is acceptable for most people.";
            break;

        case 3:
            status = "🟠 Poor";
            message = "Sensitive people should reduce outdoor activities.";
            break;

        case 4:
        case 5:
        case 6:
            status = "🔴 Very Poor";
            message = "Avoid prolonged outdoor activities.";
            break;

        default:
            status = "N/A";
            message = "";
    }

    document.getElementById("aqiStatus").textContent = status;
    document.getElementById("aqiMessage").textContent = message;

    // ================= FORECAST =================

    const forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    data.forecast.forecastday.forEach(day => {

        forecast.innerHTML += `

        <div class="forecast-card">

            <h3>${day.date}</h3>

            <img src="https:${day.day.condition.icon}" alt="Forecast">

            <h2>${day.day.avgtemp_c}°C</h2>

            <p>${day.day.condition.text}</p>

            <p>💧 ${day.day.daily_chance_of_rain}%</p>

        </div>

        `;

    });

    // ================= BACKGROUND =================

    updateBackground(data.current.condition.text);

}

/*=========================================
        BACKGROUND
=========================================*/

function updateBackground(condition) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snow"
    );

    condition = condition.toLowerCase();

    if (condition.includes("sun")) {

        document.body.classList.add("sunny");

    }

    else if (
        condition.includes("rain") ||
        condition.includes("drizzle")
    ) {

        document.body.classList.add("rainy");

    }

    else if (
        condition.includes("cloud")
    ) {

        document.body.classList.add("cloudy");

    }

    else if (
        condition.includes("snow")
    ) {

        document.body.classList.add("snow");

    }

}
/*=========================================
        TEMPERATURE TOGGLE
=========================================*/

unitBtn.addEventListener("click", () => {

    if (isCelsius) {

        document.getElementById("temperature").textContent =
            currentTempF + "°F";

        isCelsius = false;

        unitBtn.textContent = "°F";

    } else {

        document.getElementById("temperature").textContent =
            currentTempC + "°C";

        isCelsius = true;

        unitBtn.textContent = "°C";

    }

});

/*=========================================
        DARK MODE
=========================================*/

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const icon = themeBtn.querySelector("i");

    if (document.body.classList.contains("dark")) {

        icon.className = "fa-solid fa-sun";

        localStorage.setItem("theme", "dark");

    } else {

        icon.className = "fa-solid fa-moon";

        localStorage.setItem("theme", "light");

    }

});

/*=========================================
        SEARCH HISTORY
=========================================*/

function saveHistory(city) {

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    city = city.trim();

    // Remove duplicate entries
    history = history.filter(
        item => item.toLowerCase() !== city.toLowerCase()
    );

    // Add latest search at top
    history.unshift(city);

    // Keep only last 5 searches
    history = history.slice(0, 5);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    loadHistory();

}

function loadHistory() {

    historyBox.innerHTML = "";

    const history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.forEach(city => {

        const btn = document.createElement("button");

        btn.className = "history-btn";

        btn.textContent = city;

        btn.addEventListener("click", () => {

            cityInput.value = city;

            getWeather(city);

        });

        historyBox.appendChild(btn);

    });

}

/*=========================================
        INITIAL LOAD
=========================================*/

window.addEventListener("load", () => {

    // Theme

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeBtn.querySelector("i").className =
            "fa-solid fa-sun";

    }

    // Search History

    loadHistory();

    // Default City

    getWeather("Indore");

});