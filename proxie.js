#!/usr/bin/env node
/*This sample code assumes the request-promise package is installed. If it is not installed run: "npm install request-promise"*/
require("request-promise")({
  url: "http://geo.brdtest.com/mygeo.json",
  proxy:
    "http://brd-customer-hl_a0b416c0-zone-first_proxies:y2bw3y44avu8@brd.superproxy.io:22225",
}).then(
  function (data) {
    console.log(data);
  },
  function (err) {
    console.error(err);
  }
);
