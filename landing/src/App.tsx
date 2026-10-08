import { Nav } from '@landing/components/Nav';
import { AiControl } from '@landing/sections/AiControl';
import { Controls } from '@landing/sections/Controls';
import { FinalCta, Footer, Story } from '@landing/sections/Cta';
import { Hero } from '@landing/sections/Hero';
import { LocalFirst } from '@landing/sections/LocalFirst';
import { NodeTypes } from '@landing/sections/NodeTypes';
import { Roadmap } from '@landing/sections/Roadmap';

export default function App() {
  return (
    <div className="relative min-h-screen bg-canvas text-fg antialiased">
      <Nav />
      <main>
        <Hero />
        <Story />
        <NodeTypes />
        <Controls />
        <LocalFirst />
        <AiControl />
        <Roadmap />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
