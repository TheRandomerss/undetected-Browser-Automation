const { chromium } = require("playwright");
const { links } = require("./data");

const OpenBrowser = async (ad) => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
    // proxy: {
    //   server: "148.113.161.145:5959",
    //   username: "doublemobmedia-res-us-sid-",
    //   password: "47Vehty00u6WpDQ",
    // },
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    locale: "en-US",
    timezoneId: "America/New_York",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  // Inject custom scripts to modify WebRTC, Canvas, GPU, CPU, RAM, and other attributes
  await context.addInitScript(() => {
    // Modify navigator properties
    Object.defineProperty(navigator, "platform", { get: () => "Win32" });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 16 });
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
        options.timeZone = "America/New_York";
        super(locales, options);
      }
    };
  });

  const page = await context.newPage();
  await page.goto(ad);

  await new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * 5000))
  );

  await page.mouse.wheel(0, Math.floor(Math.random() * 5000));
  await page.mouse.click(400, 400);

  // await context.close();
  // await browser.close();
};

const navigateThroughLinks = async () => {
  OpenBrowser("https://bot.sannysoft.com/");
  links.map((link) => {
    console.log(link.link);
    // OpenBrowser(link.link);
  });
};
navigateThroughLinks();
