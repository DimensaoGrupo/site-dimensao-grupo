import { listActiveBanners } from "@/lib/banners/queries";
import HeroClient from "./HeroClient";

export default async function Hero() {
  const banners = await listActiveBanners();

  return (
    <HeroClient
      slides={banners.map((banner) => ({
        id: banner.id,
        image: banner.image,
        eyebrow: banner.eyebrow,
        title: banner.title,
        text: banner.text,
      }))}
    />
  );
}
