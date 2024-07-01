const { chromium } = require("playwright");
const { links, proxyArray } = require("./data");

function generateRandomNumber(min, max) {
  var minm = min;
  var maxm = max;
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

const OpenBrowser = async (ad, username) => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
    proxy: {
      server: "gw-doublemobmedia.ntnt.io:5959",
      username: username,
      password: "47Vehty00u6WpDQ",
    },
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    locale: "en-US",
    timezoneId: "America/New_York",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });

  const usaTimezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "America/Phoenix",
    "America/Indiana/Indianapolis",
    "Pacific/Honolulu",
  ];

  const getRandomTimezone = () => {
    return usaTimezones[Math.floor(Math.random() * usaTimezones.length)];
  };

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "platform", { get: () => "Win32" });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => 16,
    });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 16 });

    // Modify WebRTC properties
    Object.defineProperty(navigator, "userAgent", {
      get: () =>
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });

    // Random GPU name function
    function getRandomGPU() {
      const gpuNames = [
        {
          name: "NVIDIA GTX 1650",
          renderer:
            "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "NVIDIA GTX 1080",
          renderer:
            "ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "NVIDIA RTX 3090",
          renderer:
            "ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "NVIDIA RTX 3050",
          renderer:
            "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "NVIDIA RTX 4060",
          renderer:
            "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "AMD RX 580",
          renderer:
            "ANGLE (AMD, Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "AMD RX 6800",
          renderer:
            "ANGLE (AMD, Radeon RX 6800 Series Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "Intel Iris Xe",
          renderer:
            "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "Intel UHD Graphics 630",
          renderer:
            "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
        {
          name: "NVIDIA Quadro P4000",
          renderer:
            "ANGLE (NVIDIA, NVIDIA Quadro P4000 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        },
      ];
      return gpuNames[Math.floor(Math.random() * gpuNames.length)];
    }

    const gpuInfo = getRandomGPU();

    // Modify WebGL properties
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (param) {
      if (param === 37445) {
        return "Mozilla"; // UNMASKED_VENDOR_WEBGL
      }
      if (param === 37446) {
        return gpuInfo.renderer; // UNMASKED_RENDERER_WEBGL
      }
      return originalGetParameter.call(this, param);
    };

    // Modify navigator properties
    Object.defineProperty(navigator, "gpu", { get: () => gpuInfo.name });

    // Modify WebGPU properties
    navigator.gpu = {
      getAdapter: async () => ({ name: gpuInfo.name + " Adapter" }),
      requestDevice: async () => ({ name: gpuInfo.name + " Device" }),
    };

    // Modify Canvas fingerprinting
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attributes) {
      const context = originalGetContext.call(this, type, attributes);
      if (type === "2d") {
        const originalGetImageData = context.getImageData;
        context.getImageData = function (sx, sy, sw, sh) {
          const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageData.data[i] ^ 0xff;
          }
          return imageData;
        };
      }
      return context;
    };

    // Modify timezone
    Intl.DateTimeFormat = class extends Intl.DateTimeFormat {
      constructor(locales, options = {}) {
        options.timeZone = getRandomTimezone();
        super(locales, options);
      }
    };
  });

  const blockedDomains = ["www.opera.com"];

  // Intercept network requests in the context
  await context.route("**/*", (route) => {
    const request = route.request();

    // Get the hostname of the request
    const url = new URL(request.url());
    const hostname = url.hostname;

    // Check if the hostname matches any blocked domain
    if (blockedDomains.includes(hostname)) {
      console.log(`Blocking request to ${hostname}`);
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    const page = await context.newPage();
    await page.goto(ad, {
      waitUntil: "load",
      timeout: 15000, // Increase timeout to 60 seconds
    });

    await new Promise((resolve) => setTimeout(resolve, Math.floor(25000)));

    await context.close();
    await browser.close();
  } catch (error) {
    await context.close();
    await browser.close();
  }
};

const tasksPoll = async () => {
  const tasks = links.map((ad) => {
    const username =
      "doublemobmedia-res-us-sid-" + String(generateRandomNumber(100, 100000));
    console.log(username);
    return OpenBrowser(ad.link, username);
  });

  await Promise.all(tasks);
};

const RunTasks = async () => {
  for (let i = 0; i < 100; i++) {
    await tasksPoll();
  }
};

RunTasks();
