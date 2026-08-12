import Header from "./Header";
import { listPublishedServices } from "@/lib/services/queries";

// Header itself stays a Client Component (it owns scroll/GSAP/mobile-panel
// state) and can't read the DB directly, so this thin Server Component does
// the live services lookup and hands the dropdown items down as a prop —
// every page that renders <Header/> renders <HeaderNav/> instead.
export default async function HeaderNav() {
  const services = await listPublishedServices();

  return (
    <Header
      services={services.map((service) => ({
        label: service.title,
        href: `/servicos/${service.slug}`,
      }))}
    />
  );
}
