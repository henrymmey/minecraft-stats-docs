import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Minecraft Stats Platform",
  description: "Documentation for the Minecraft Stats Platform",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/introduction/" },
      { text: "API", link: "/api/" },
      { text: "Self-hosting", link: "/self-hosting/" },
      { text: "GitHub", link: "https://github.com/henrymmey/minecraft-stats-server" }
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Overview", link: "/introduction/" }
        ]
      },
      {
        text: "Client",
        items: [{ text: "Fabric Client", link: "/client/" }]
      },
      {
        text: "Server",
        items: [{ text: "Server", link: "/server/" }]
      },
      {
        text: "Self-hosting",
        items: [{ text: "Deployment", link: "/self-hosting/" }]
      },
      {
        text: "Security",
        items: [{ text: "Security Model", link: "/security/" }]
      },
      {
        text: "API",
        items: [{ text: "Reference", link: "/api/" }]
      },
      {
        text: "Development",
        items: [{ text: "Development", link: "/development/" }]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/henrymmey/minecraft-stats-docs" }
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Minecraft Stats Platform contributors"
    }
  }
});
