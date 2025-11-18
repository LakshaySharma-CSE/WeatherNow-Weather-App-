const cityInput = document.querySelector('.city-input')
const searchbtn = document.querySelector('.search-btn')
const apikey = 'dc657e908549b55dda21432930b6c67e'

searchbtn.addEventListener('click',() =>{
    if(cityInput.value.trim() != ''){
        console.log(cityInput.value)
        updateweatherinfo()
        cityInput.value=''
        cityInput.blur()
    }
})
cityInput.addEventListener('keydown',(event) =>{
    if (event.key == 'Enter' && 
        cityInput.value.trim() !=''
    ){
        updateweatherinfo()
        cityInput.value=''
        cityInput.blur()
    }
})

async function getfetchdata(endPoint,city){
 const apiurl = 'https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric'
 
 const response = await fetch(apiurl)

 return response.json()
}

async function updateweatherinfo(city){
    const weaterdata=getfetchdata('weather',city)
    console.log(weaterdata)
}