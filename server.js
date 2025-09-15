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
import { publicIpv4 } from "public-ip"
import { internalIpV4, internalIpV4Sync } from "internal-ip"
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
server.listen(8080);


app.get("/teacher", (req, res, next) => {console.log("teacher"); res.sendFile(__dirname+"/src/index.html")})

app.get("/", (req, res) => {console.log("classmate"); res.sendFile(__dirname+"/public/index.html")})

app.get("/scripts/qrcode", (req, res)=>{
  console.log("asdfadfgasdg")
  res.sendFile(__dirname + '/bundle.js')
})

app.get("/scripts/gameStart", (req, res)=>{
  console.log("gamestart")
  res.sendFile(__dirname + '/public/gameStart-bundle.js')
})

app.get("/index.pck", (req, res) => {
  res.sendFile(__dirname + '/public/index.pck')
})

app.get("/index.wasm", (req, res) => {
  res.sendFile(__dirname + '/public/index.wasm')
})
app.get("/Resources.pck", (req, res) => {
  res.sendFile(__dirname + '/public/Resources.pck')
})
app.get("/server_ip", (req, res)=>{
  let serverIpAddress = "192.168.0.94";
  console.log(serverIpAddress)
  res.json({ip:serverIpAddress})
})
app.use(express.json())
app.use(express.static('node_modules'));
app.use(express.static('src'));
app.use(express.static('public'));