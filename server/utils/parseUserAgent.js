import UAParser from "ua-parser-js";

export default function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const ua = parser.getResult();

  return {
    browser: ua.browser.name,
    os: ua.os.name,
    device: ua.device.type || "desktop",
  };
}