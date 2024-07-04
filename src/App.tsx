
import { useEffect, useRef } from 'react';
import './App.css'

// const WEATHER_KEY = "dd58c3363aaa4430ada64f58273aae0e";
const WEATHER_KEY = "89c15f3774b34e2e9d8eca4283f8f550";
const LOCATION_KEY = "4oYgjkdycIcPNPOwwIuacrrGxw4Jihle";

type CityItem = {
  city: string
  lng: number
  lat: number
}

type WeatherItem = {
  date: string,
  max: string,
  min: string,
  textDay: string,
  textNight: string
}

const cities = ['北京', '天津', '上海', '重庆', '哈尔滨', '长春', '沈阳', '呼和浩特', '石家庄', '乌鲁木齐', '西宁', '兰州', '银川', '郑州', '南京', '济南', '合肥', '南昌', '武汉', '长沙', '广州', '南宁', '海口', '成都', '贵阳', '昆明', '拉萨', '西安', '太原', '福州', '台北', '香港', '澳门'];
// const cities = ['北京', '天津', '上海', '重庆', '哈尔滨', '长春', '沈阳'];

async function fetchCityData(city: string){
    let specialCity = '';
    if(city === '西安'){
      specialCity = '陕西省西安市'
    }
    const url = `/locationApi/?address=${encodeURIComponent(specialCity || city)}&output=json&ak=${LOCATION_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return { city, data: data?.result?.location }
    }catch(error){
      console.error(error)
    }
} 

async function fetchAllCityData (){
  try{
    const results = await Promise.all(cities.map(async item => await fetchCityData(item)));
    return results
  }catch(error){
      console.error(error)
  }
}

// async function fetch7DWeatherData(city: CityItem){ 
//   try{
//       const url = `/weatherApi?location=${`${city.lng.toFixed(2)},${city.lat.toFixed(2)}`}&key=${WEATHER_KEY}`;
//       const response = await fetch(url)
//       const result = await response.json()
//       if(result?.code === '200'){
//         const data = result?.daily?.map((item: any)=> {
//           return {
//             date: item?.fxDate,
//             max: item?.tempMax,
//             min: item?.tempMin,
//             textDay: item?.textDay,
//             textNight: item?.textNight
//           }
//         })
//         return data
//       }
//   }catch(error){
//     console.error(error)
//   }
// }

function fetch7DWeatherData(city: CityItem, callBack: Function){ 
  const url = `/weatherApi?location=${`${city.lng.toFixed(2)},${city.lat.toFixed(2)}`}&key=${WEATHER_KEY}`;
  fetch(url)
    .then(response=> response.json())
    .then(results => {
      if(results?.code === '200'){
        const data = results?.daily?.map((item: any)=> {
          return {
            date: item?.fxDate,
            max: item?.tempMax,
            min: item?.tempMin,
            textDay: item?.textDay,
            textNight: item?.textNight
          }
        })
        callBack && callBack(data)
      }
    })
}

const App = () => {
  const mapInit = (map: any, cities: CityItem[]) => {
    let point = new window.BMap.Point(116.404, 39.915);
    map.centerAndZoom(point, 5);
    map.enableScrollWheelZoom(true);
    map.enableAutoResize(true);
    cities?.forEach(async function(city) {
      let point = new window.BMap.Point(city.lng, city.lat);
      setMapMarker(point, map);
      setMapLabel(city, point, map);
    });
  };

  const setMapMarker = (point: any, map: any)=> {
    let marker = new window.BMap.Marker(point);
    map.addOverlay(marker);
  }

  const setMapLabel = (city: CityItem, point: any, map: any)=> {
    let label = new window.BMap.Label(city.city, {
      position: point
    })
    map.addOverlay(label);
    label.setStyle({
      color: '#000',
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "3px",
      padding: "5px",
      fontSize: '12px',
      textDecoration: 'underline'

    })
    label.addEventListener("click", function () {
      fetch7DWeatherData(city, (data: WeatherItem[])=> {
        const infoWindow = createCityWindow(city.city, data)
        map.openInfoWindow(infoWindow, label.getPosition());
      })
    });
  }

  const createCityWindow = (cityName: string, data: WeatherItem[])=> {
    let content=`<table><tr><th width=100>日期</th><th width=100>白天</th><th width=100>晚上</th><th width=100>气温</th></tr>`; 
    data.forEach(item=> {
      content += `<tr><td width=100>${item.date}</td><td width=100>${item.textDay}</td><td width=100>${item.textNight}</td><td width=100>${`${item.min}℃~${item.max}℃`}</td></tr>`
    })
    content += `</table>`
    return new window.BMap.InfoWindow(content, {
      enableMessage: true ,
      width: 400,
      title: cityName
    });
  }

  const init = (map: any)=> {
    
    if(localStorage.getItem("cities")){
      try {
        let cities = JSON.parse(localStorage.getItem("cities") ?? '')
        mapInit(map, cities)
      }catch(error){
        console.error("JSON parse error")
      }
    }else {
      fetchAllCityData().then(results => {
        let cities = results?.map(item=> ({
          city: item?.city ?? '',
          lng: item?.data?.lng,
          lat: item?.data?.lat
        })) ?? []
        localStorage.setItem("cities", JSON.stringify(cities))
        mapInit(map, cities)
      }).catch(error => {
        console.error(error)
      })
    }
  }

  const resizeMap = (map: any)=> {
    const resizeMap = ()=> { map.checkResize(); map.reset()} 
    window.addEventListener('resize', resizeMap);
    return ()=> window.removeEventListener('resize', resizeMap)
  }

  useEffect(() => {
    let map = new window.BMap.Map("map");
    init(map);
    resizeMap(map);
  }, [])

  return (
    <>
      <div id='map'></div>
    </>
  )
}

export default App
