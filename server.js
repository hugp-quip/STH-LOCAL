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
import configs from "./server_config";

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
console.log("Server listening at: https://localhost:" + configs.port)

app.get("/teacher", (req, res, next) => {console.log("teacher"); res.sendFile(__dirname+"/src/index.html")})

app.get("/", (req, res) => {console.log("classmate"); res.sendFile(__dirname+"/public/Index.html")})

app.get("/scripts/qrcode", (req, res)=>{
  console.log("asdfadfgasdg")
  res.sendFile(__dirname + '/bundle.js')
})

app.get("/scripts/gameStart", (req, res)=>{
  console.log("gamestart")
  res.sendFile(__dirname + '/public/gameStart-bundle.js')
})

app.get("/index.pck", (req, res) => {
  res.sendFile(__dirname + '/public/Index.pck')
})

app.get("/index.wasm", (req, res) => {
  res.sendFile(__dirname + '/public/Index.wasm')
})
app.get("/Resources.pck", (req, res) => {
  res.sendFile(__dirname + '/public/Resources.pck')
})


//essa request retorna o ip do server, por algum motivo essa biblioteca demora muito para retornar o ip, então eu decidi simplesmente mandar o node esperar um tempo x 💀
console.log("Finding this computer's ip adress:")
let serverIpAddress;
// function getLocalIpAddress() {
//   const networkInterfaces = os.networkInterfaces();
//   for (const interfaceName in networkInterfaces) {
//     const networkInterface = networkInterfaces[interfaceName];
//     for (const iface of networkInterface) {
//       // Filter out internal and non-IPv4 addresses
//       if (iface.family === 'IPv4' && !iface.internal) {
//         return iface.address;
//       }
//     }
//   }
//   return null; // No suitable IP address found
// }
serverIpAddress = configs.ip//getLocalIpAddress();

app.get("/server_ip", async (req, res)=>{
  console.log("ip-fetched: "+serverIpAddress)
  res.json({ip:serverIpAddress})
})

app.use(express.json())
app.use(express.static('node_modules'));
app.use(express.static('src'));
app.use(express.static('public'));