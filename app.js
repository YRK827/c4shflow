const express = require("express");
const path = require("node:path");
const { Eta } = require("eta");
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();

// CORS 설정
app.use(cors());
app.use(express.static("public"));

const eta = new Eta({
  views: path.join(__dirname, "views"),
  cache: true
});

app.get("/", (req, res) => {
  const renderedTemplate = eta.render("index", { title: "Hello", place: "there!" });
  res.status(200).send(renderedTemplate);
});

// 수입/지출 추가 페이지
app.get("/add", (req, res) => {
  const renderedTemplate = eta.render("add", { title: "추가" });
  res.status(200).send(renderedTemplate);
});

// 예산 설정 페이지
app.get("/budget", (req, res) => {
  const renderedTemplate = eta.render("budget", { title: "예산 설정" });
  res.status(200).send(renderedTemplate);
});

// HTTP 서버 설정 (개발용)
app.listen(3000, '0.0.0.0', () => {
  console.log("HTTP Server listening on all network interfaces at port 3000");
  console.log("Local access via: http://localhost:3000");
  console.log("To access from other devices on your network, use your computer's IP address");
});

// 로컬 IP 주소 출력
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
console.log("\nAvailable network interfaces:");
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // IPv4 주소만 표시
        if (net.family === 'IPv4' && !net.internal) {
            console.log(`Interface: ${name}, IP: ${net.address}`);
        }
    }
}