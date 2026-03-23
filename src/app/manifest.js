import { site } from "@/config/site";

export default function manifest() {
  return {
    name: site.name,
    short_name: site.nameEn,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f4",
    theme_color: "#b91c1c",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/screenshots/ads.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
