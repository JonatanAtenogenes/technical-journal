import Header from '@/components/layout/header';
import Hero from '@/components/home/hero';
import Projects from '@/components/home/projects';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
      </main>
    </>
  );
}
