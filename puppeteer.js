const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");

// Add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Function to get random GPU names
function getRandomGPUName() {
  const gpuNames = [
    "NVIDIA GTX 1650",
    "NVIDIA GTX 1080",
    "NVIDIA RTX 3090",
    "NVIDIA RTX 3050",
    "NVIDIA RTX 4060",
  ];
  return gpuNames[Math.floor(Math.random() * gpuNames.length)];
}

// Puppeteer usage as normal
puppeteer
  .launch({ headless: false, executablePath: executablePath() })
  .then(async (browser) => {
    console.log("Running tests...");
    const page = await browser.newPage();

    // Modify various browser properties
    await page.evaluateOnNewDocument(() => {
      // Change WebRTC properties
      const getUserMedia = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices
      );
      navigator.mediaDevices.getUserMedia = async (...args) => {
        const stream = await getUserMedia(...args);
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        capabilities.deviceId = "fake-device-id";
        return stream;
      };

      // Modify navigator properties
      Object.defineProperty(navigator, "platform", { get: () => "Win32" });
      Object.defineProperty(navigator, "hardwareConcurrency", {
        get: () => 16,
      });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 16 });
      Object.defineProperty(navigator, "language", { get: () => "en-US" });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Modify GPU properties
      const gpuName = getRandomGPUName();
      Object.defineProperty(navigator, "userAgent", {
        get: () =>
          `Mozilla/5.0 (Windows NT 10.0; Win64; x64; ${gpuName}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36`,
      });

      // Modify WebGPU properties
      navigator.gpu = {
        getAdapter: async () => ({ name: gpuName + " Adapter" }),
        requestDevice: async () => ({ name: gpuName + " Device" }),
      };

      // Modify WebGL properties
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === WebGLRenderingContext.RENDERER) {
          return gpuName;
        }
        if (parameter === WebGLRenderingContext.VENDOR) {
          return "NVIDIA Corporation";
        }
        if (parameter === WebGLRenderingContext.VERSION) {
          return "WebGL 2.0 (NVIDIA)";
        }
        if (parameter === WebGLRenderingContext.SHADING_LANGUAGE_VERSION) {
          return "WebGL GLSL ES 1.00 (NVIDIA)";
        }
        return getParameter(parameter);
      };

      // Modify timezone
      Intl.DateTimeFormat = class extends Intl.DateTimeFormat {
        constructor(locales, options = {}) {
          options.timeZone = "America/New_York";
          super(locales, options);
        }
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
              imageData.data[i] = imageData.data[i] ^ 0xff; // Invert colors as an example
            }
            return imageData;
          };
        }
        return context;
      };

      // Modify the toDataURL method
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
        return originalToDataURL
          .call(this, type, quality)
          .replace("canvas", "canvas-modified");
      };

      // Modify the toBlob method
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
        return originalToBlob.call(
          this,
          function (blob) {
            const newBlob = new Blob([blob], { type: blob.type });
            newBlob.name = "canvas-modified";
            callback(newBlob);
          },
          type,
          quality
        );
      };
    });

    await page.goto("https://bot.sannysoft.com");

    console.log(`All done, check the screenshot. ✨`);
  });
