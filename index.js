
//let fetch = await import('node-fetch');
const fetch = require("node-fetch");

// current timestamp in milliseconds
let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();
let h = date_ob.getHours();
let m = date_ob.getMinutes();
let s = date_ob.getSeconds();

// prints date & time in YYYY-MM-DD format
console.log(year + "-" + month + "-" + date + " " + h + ":" + m + ":" + s);
//console.log(ts);

fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=sterling&units=metric&APPID=2223925c73619c0db7b4c88fa96da99f"
)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((err) => console.log(err));