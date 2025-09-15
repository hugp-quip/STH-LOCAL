//import QRCode from "node-qrcode"
var QRCode = require("qrcode");

var canvas = document.getElementById('canvas')

var serverIpAddress = await fetch("https://localhost:8080/server_ip")

QRCode.toCanvas(canvas, "https://"+serverIpAddress+':8080', function (error) {
  if (error) console.error(error)
  console.log('success!');
})