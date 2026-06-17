import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Flow } from "@/components/sections/Flow";
import { Features } from "@/components/sections/Features";
import { Trust } from "@/components/sections/Trust";
import { TryItLive } from "@/components/sections/TryItLive";
import { Audiences } from "@/components/sections/Audiences";
import { Waitlist } from "@/components/sections/Waitlist";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Flow />
        <Features />
        <Trust />
        <TryItLive />
        <Audiences />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
