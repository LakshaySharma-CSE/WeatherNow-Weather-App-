const apikey = "dc657e908549b55dda21432930b6c67e";

const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const suggestionBox = document.querySelector(".suggestions");
const locBtn = document.getElementById("locBtn");

const searchMsg = document.getElementById("searchMsg");
const notFound = document.getElementById("notFound");
const weatherInfo = document.getElementById("weatherInfo");

const countryText = document.querySelector(".country-text");
const dateText = document.querySelector(".country-txt");
const tempText = document.querySelector(".temp-txt");
const condText = document.querySelector(".condition-txt");
const feelsText = document.querySelector(".feels-txt");
const humidityText = document.querySelector(".Humidity-value-txt");
const windText = document.querySelector(".Wind-value-txt");
const weatherImg = document.querySelector(".weather-summary-img img");
const forecastEl = document.querySelector(".forecast");

let typingTimer;
let selectedIndex = -1;

// Make country flag
function countryFlag(code){
  return String.fromCodePoint(...[...code.toUpperCase()].map(c=>127397+c.charCodeAt()));
}

// Live auto-suggest input handler
cityInput.addEventListener("input",()=>{
  clearTimeout(typingTimer);
  const q = cityInput.value.trim();
  if(!q){ suggestionBox.style.display="none"; return; }
  typingTimer=setTimeout(()=> fetchSuggest(q), 300);
});

// Hide suggestions when clicking outside
document.addEventListener("click",(e)=>{
  if(!e.target.closest(".search")) suggestionBox.style.display="none";
});

// Keyboard navigation for suggestions
cityInput.addEventListener("keydown",(e)=>{
  const items = suggestionBox.querySelectorAll("li");

  if(e.key==="ArrowDown"){
    e.preventDefault();
    selectedIndex = (selectedIndex+1)%items.length;
    updateActive(items);
  }
  else if(e.key==="ArrowUp"){
    e.preventDefault();
    selectedIndex = (selectedIndex-1+items.length)%items.length;
    updateActive(items);
  }
  else if(e.key==="Enter"){
    e.preventDefault();
    if(selectedIndex>=0 && items[selectedIndex]) items[selectedIndex].click();
    else if(cityInput.value.trim()) doSearch(cityInput.value.trim());
  }
});

function updateActive(items){
  items.forEach(i=>i.classList.remove("active"));
  if(items[selectedIndex]) items[selectedIndex].classList.add("active");
}

// Fetch city suggestions
async function fetchSuggest(q){
  const url=`https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=7&appid=${apikey}`;
  const res=await fetch(url);
  const list=await res.json();

  suggestionBox.innerHTML="";
  selectedIndex=-1;

  if(!list.length){ suggestionBox.style.display="none"; return; }

  list.forEach(c=>{
    const li=document.createElement("li");
    const state=c.state?`, ${c.state}`:"";

    li.innerHTML=
      `${countryFlag(c.country)} ${c.name}${state}
       <span style="color:gray">${c.country}</span>`;

    li.addEventListener("click",()=>{
      cityInput.value=c.name;
      suggestionBox.style.display="none";
      doSearchByCoords(c.lat,c.lon,c.name);
    });

    suggestionBox.appendChild(li);
  });

  suggestionBox.style.display="block";
}

// Standard search button
searchBtn.addEventListener("click",()=>{
  if(cityInput.value.trim()) doSearch(cityInput.value.trim());
});

// GPS current location button
locBtn.addEventListener("click",()=>{
  navigator.geolocation.getCurrentPosition(pos=>{
    doSearchByCoords(pos.coords.latitude, pos.coords.longitude, "Your Location");
  },()=> alert("Please allow location to use GPS weather"));
});

// Search by name
async function doSearch(city){
  show("loading");

  const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`;
  const res=await fetch(url);
  const data=await res.json();

  if(data.cod!=200){ show("notfound"); return; }

  renderWeather(data);
}

// Search by coordinates
async function doSearchByCoords(lat,lon,label){
  show("loading");

  const url=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
  const res=await fetch(url);
  const data=await res.json();

  if(data.cod!=200){ show("notfound"); return; }

  renderWeather(data, label);
}

// UI state switching helper
function show(type){
  if(type==="search" || type==="loading"){
    searchMsg.style.display="flex";
    notFound.style.display="none";
    weatherInfo.style.display="none";
  }
  else if(type==="notfound"){
    searchMsg.style.display="none";
    notFound.style.display="flex";
    weatherInfo.style.display="none";
  }
  else{
    searchMsg.style.display="none";
    notFound.style.display="none";
    weatherInfo.style.display="block";
  }
}

// Render weather and forecast
async function renderWeather(data,label){
  countryText.textContent= label || data.name;
  tempText.textContent= Math.round(data.main.temp)+"℃";
  condText.textContent= data.weather[0].main;
  feelsText.textContent= Math.round(data.main.feels_like)+"℃";
  humidityText.textContent= data.main.humidity+"%";
  windText.textContent= data.wind.speed+" m/s";

  const icon=data.weather[0].icon;
  weatherImg.src=`https://openweathermap.org/img/wn/${icon}@2x.png`;

  const d=new Date();
  dateText.textContent=d.toLocaleDateString("en-US",{weekday:"short",day:"2-digit",month:"short"});

  // Forecast
  const forecastUrl=`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apikey}&units=metric`;
  const res=await fetch(forecastUrl);
  const forecast=await res.json();

  renderForecast(forecast);

  show("weather");
}

function renderForecast(forecast){
  forecastEl.innerHTML="";

  const map={};
  forecast.list.forEach(e=>{
    const date=e.dt_txt.split(" ")[0];
    if(!map[date] && e.dt_txt.includes("12:00:00"))
      map[date]=e;
  });

  Object.values(map).slice(0,5).forEach(day=>{
    const dt=new Date(day.dt_txt);
    const label=dt.toLocaleDateString("en-US",{day:"2-digit",month:"short"});
    const icon=day.weather[0].icon;
    const temp=Math.round(day.main.temp);

    const div=document.createElement("div");
    div.className="forecast-item";
    div.innerHTML=`
      <strong>${label}</strong>
      <img src="https://openweathermap.org/img/wn/${icon}.png">
      <div style="font-weight:800">${temp}℃</div>
    `;
    forecastEl.appendChild(div);
  });
}

// Default UI state
show("search");
