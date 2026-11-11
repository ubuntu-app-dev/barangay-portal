import {
  CallToAction,
  DataPrivacy,
  Gallery,
  Hero,
  StatsStrip,
  SystemsOverview,
  UserLevels,
  Workflow,
} from "@/components/landing";
import { Footer, Header } from "@/components/layout";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <StatsStrip />
        <SystemsOverview />
        <UserLevels />
        <Gallery />
        <Workflow />
        <DataPrivacy />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
