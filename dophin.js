const { chromium } = require("playwright");
const fetchProfileData = async () => {
  let profileId = 410796431;
  const response = await fetch(
    `http://localhost:3001/v1.0/browser_profiles/${profileId}/start?automation=1%D0%A2%D0%B0%D0%BA`
  );
  const data = await response.text();
  const JsonData = JSON.parse(data);
  console.log(JsonData);

  const port = JsonData?.automation?.port;
  const wsEndpoint = JsonData?.automation?.wsEndpoint;

  (async () => {
    const browser = await chromium.connectOverCDP(
      `ws://127.0.0.1:${port}${wsEndpoint}`
    );

    const page = await browser.contexts()[0].newPage();
    const context = browser.contexts()[0];
    await context.clearCookies();

    // Clear browser history
    await context.clearPermissions();

    await page.goto(
      "https://www.highrevenuenetwork.com/g3kg2b8ckp?key=90306aa409870c7d83a8066001afaed7"
    );
    await new Promise((resolve) => setTimeout(resolve, 15000)); // 5000 milliseconds = 5 seconds
    await fetch(
      `http://localhost:3001/v1.0/browser_profiles/${profileId}/stop`
    );
  })();
};

fetchProfileData();
