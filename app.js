navigator.geolocation.getCurrentPosition(function(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  // Make request to weather API
  var apiKey = "6fc48f11003b0c799f8a97af185753cf";
  var apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Get sunset and sunrise times
      var sunsetTime = data.sys.sunset;
      var sunriseTime = data.sys.sunrise;
      
      // Get current time
      var currentTime = new Date().getTime() / 1000;
      
      // Determine if it is night or day
      if (currentTime > sunsetTime || currentTime < sunriseTime) {
        // It is currently night
        document.getElementById("result").textContent = "Yep.";
        document.body.classList.add('night');
      } else {
        // It is currently day
        document.getElementById("result").textContent = "Nope.";
        document.body.classList.remove('night');
      }
      
      // Set GPS flag
      document.body.classList.add('gps');
    });
});