const http = require('http');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, "data.json")
const viewPath = path.join(__dirname, 'view.html');
const viewSize = fs.statSync(viewPath).size;

var saved = false;

var data = {};

if (!fs.existsSync(dataPath)) {
  data = {user_number: 0, logs: []};
  fs.writeFileSync(dataPath, JSON.stringify(data));
}
else {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveToFile() {
  fs.writeFileSync(dataPath, JSON.stringify(data));
}

process.on("SIGINT", saveAndExit);
process.on("exit", saveAndExit);


function saveAndExit() {
  if (saved) process.exit();
  saved = true;
  saveToFile();
  process.exit();
}

setInterval(saveToFile, 15 * 60 * 1000) // Autosave every 15 mins



const server = http.createServer((req, res)=>{
  if (req.method === "POST" && req.url === "/increment_user") {
    data.user_number++;
    data.logs.unshift((new Date).toString())
    res.statusCode = 200;
    res.end()
  }
  else if (req.method === "GET" && req.url === "/view") {

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': viewSize
    });

    const readStream = fs.createReadStream(viewPath);
    readStream.pipe(res);
  }
  if (req.method === "GET" && req.url === "/data") {

    res.writeHead(200, {"Content-Type": "application/json"})
    res.write(JSON.stringify(data, null, 2))
    res.end();

  }
  else {
    res.statusCode = 404;
    res.end();
  }
})

server.listen(8000, ()=>{
  console.log("Server Online");
})
