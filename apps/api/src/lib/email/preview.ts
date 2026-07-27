import { createServer } from "node:http";
import {
  getOrderStatusEmailHtml,
  getShippingNoticeEmailHtml,
  getWelcomeEmailHtml,
  type EmailTemplate,
} from "./templates.js";

const port = Number(process.env.EMAIL_PREVIEW_PORT ?? 3110);

const previews: Record<string, () => EmailTemplate> = {
  welcome: () => getWelcomeEmailHtml({ name: "Taylor Morgan" }),
  submitted: () =>
    getOrderStatusEmailHtml({
      customerName: "Taylor Morgan",
      orderNumber: "GD-1042",
      status: "submitted",
      items: [
        { name: "Cold Brew Coffee — 12 oz case", quantity: 2, price: "$48.00" },
        { name: "Sparkling Water Variety Pack", quantity: 4, price: "$72.00" },
      ],
      totalAmount: "$120.00",
    }),
  approved: () =>
    getOrderStatusEmailHtml({
      customerName: "Taylor Morgan",
      orderNumber: "GD-1042",
      status: "approved",
      totalAmount: "$120.00",
    }),
  rejected: () =>
    getOrderStatusEmailHtml({
      customerName: "Taylor Morgan",
      orderNumber: "GD-1042",
      status: "rejected",
      totalAmount: "$120.00",
    }),
  shipping: () =>
    getShippingNoticeEmailHtml({
      customerName: "Taylor Morgan",
      orderNumber: "GD-1042",
      carrier: "UPS",
      trackingNumber: "1Z999AA10123456784",
      trackingUrl: "https://www.ups.com/track",
    }),
};

const server = createServer((request, response) => {
  const path = new URL(request.url ?? "/", `http://${request.headers.host}`).pathname;
  const previewName = path.slice(1);

  if (path === "/") {
    const links = Object.keys(previews)
      .map(
        (name) =>
          `<li style="margin: 10px 0;"><a href="/${name}" style="color: #111827;">${name}</a></li>`,
      )
      .join("");

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      `<!doctype html><html><body style="padding: 40px; font-family: Arial, sans-serif;"><h1>GoldDistro email previews</h1><ul>${links}</ul></body></html>`,
    );
    return;
  }

  const render = previews[previewName];
  if (!render) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Email preview not found");
    return;
  }

  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(render().html);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Email previews: http://localhost:${port}`);
});
