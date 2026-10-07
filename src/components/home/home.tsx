import Header from '@/components/layout/header';
import Hero from '@/components/home/hero';
import Projects from '@/components/home/projects';
import Series from '@/components/home/series';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Series />
        <Projects />
      </main>
    </>
  );
}
