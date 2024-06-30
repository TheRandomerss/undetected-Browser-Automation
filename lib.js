const { gpuNames, userAgents } = require("./data");

function getRandomGPU() {
  return gpuNames[Math.floor(Math.random() * gpuNames.length)];
}

function getRandomAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

module.exports = { getRandomGPU, getRandomAgent };
