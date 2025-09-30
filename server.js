// var express = require('express');
// var https = require('https');
// var http = require('http');
// var fs = require('fs');
import express from "express";
import https from "https";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from "os";
import configs from "./server_config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTP service.
const server = https.createServer(options, app);
server.listen(configs.port);
server.keepAliveTimeout = configs.keepAliveTimeout;
server.headersTimeout = configs.headersTimeout; 
console.log("Server listening at: https://localhost:" + configs.port)

app.get("/", (req, res) => {
  res.json({text:"Tente entrar em /teacher ou /classmate!"})
})

app.get("/teacher", (req, res, next) => {console.log("teacher"); res.sendFile(__dirname+"/src/teacher-page.html")})

app.get("/classmate", (req, res) => {
  try {
    console.log("classmate"); res.sendFile(__dirname+"/public/Index.html")
  } catch (err) {
    console.log("error: " + err)
  }
  }) 

app.get("/scripts/qrcode", (req, res)=>{
  //console.log("asdfadfgasdg")
  res.sendFile(__dirname + '/src/qrcodeGEN-bundle.js')
})

app.get("/scripts/gameStart", (req, res)=>{
  console.log("gamestart")
  res.sendFile(__dirname + '/public/gameStart-bundle.js', (err) => { console.log(err)})
})

// app.get("/index.pck", (req, res) => {
//   console.log(res.writableEnded + " " + req.headers['x-reload-request'] )
//   if (!res.writableEnded || !(req.headers['x-reload-request'] === 'true')) {  
//     res.sendFile(__dirname + '/public/Index.pck', (err) => { 
//       console.log(" index.pck"+err);
//       if (err != undefined ){
//         res.end()
//       }
//       //res.redirect("301", "/index.pck")
//     })
//   } else {
//     console.log("redirected")
//     //res.redirect("301", "/index.pck")
//   }
// })



//essa request retorna o ip do server, por algum motivo essa biblioteca demora muito para retornar o ip, então eu decidi simplesmente mandar o node esperar um tempo x 💀
console.log("Finding this computer's ip adress:")
let serverIpAddress;
serverIpAddress = (configs.ip == "no-ip-set") ? "192.168.0.94" : configs.ip

console.log("ip-is: "+serverIpAddress)

app.get("/server_ip", async (req, res)=>{
  console.log("ip-fetched: "+serverIpAddress)
  res.json({ip:serverIpAddress})
})
//app.use(cors)
app.use(express.json())
app.use(express.static('node_modules'));
app.use(express.static("public/Index.pck"))
app.use(express.static('src'));
app.use(express.static('public'));