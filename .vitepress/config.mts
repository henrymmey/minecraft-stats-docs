import { defineConfig } from "vitepress";

export default defineConfig({
  title: "HM Stats",
  description: "Operator documentation for HM Stats",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Get started", link: "/installation/" },
      { text: "Dashboard", link: "/dashboard/" },
      { text: "Client", link: "/client/configuration" },
      { text: "API", link: "/api/" },
      { text: "GitHub", link: "https://github.com/henrymmey/minecraft-stats-docs" }
    ],
    sidebar: [
      {
        text: "Start here",
        items: [
          { text: "Overview", link: "/introduction/" },
          { text: "Installation", link: "/installation/" }
        ]
      },
      {
        text: "Self-hosting",
        items: [
          { text: "Installation", link: "/installation/" },
          { text: "Domain & HTTPS", link: "/self-hosting/domain" },
          { text: "OIDC administrator login", link: "/self-hosting/oidc" },
          { text: "Maintenance & backups", link: "/self-hosting/maintenance" }
        ]
      },
      {
        text: "Dashboard",
        items: [
          { text: "Dashboard guide", link: "/dashboard/" },
          { text: "API keys", link: "/dashboard/api-keys" },
          { text: "Servers & seasons", link: "/dashboard/servers-seasons" }
        ]
      },
      {
        text: "Minecraft client",
        items: [
          { text: "Client overview", link: "/client/" },
          { text: "Installation & configuration", link: "/client/configuration" },
          { text: "Troubleshooting", link: "/client/troubleshooting" }
        ]
      },
      {
        text: "API",
        items: [
          { text: "API overview", link: "/api/" },
          { text: "Endpoint reference", link: "/api/endpoints" }
        ]
      },
      {
        text: "Operations & security",
        items: [
          { text: "Security", link: "/security/" },
          { text: "Troubleshooting", link: "/troubleshooting/" }
        ]
      },
      {
        text: "Developer",
        collapsed: true,
        items: [
          { text: "Development", link: "/development/" }
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/henrymmey/minecraft-stats-docs" }
    ]
  }
});
