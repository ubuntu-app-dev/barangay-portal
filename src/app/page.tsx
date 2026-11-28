import {
  About,
  Contact,
  Features,
  Gallery,
  Hero,
  HowItWorks,
  Security,
} from "@/components/landing";
import { Footer, Header } from "@/components/layout";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Features />
        <Gallery />
        <HowItWorks />
        <Security />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
