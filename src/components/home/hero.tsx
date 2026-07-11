import TechStackRow from '@/components/shared/tech-stack-row';

export default function Hero() {
  return (
    <section className="container mx-auto px-4 pt-14 md:pt-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Technical Journal
        </h1>

        <p className="mt-6 text-lg text-muted-foreground">
          Software engineering and data case studies documenting architecture,
          implementation, and lessons learned.
        </p>

        <p className="mt-8 text-base leading-relaxed text-muted-foreground">
          Explore real-world projects covering backend, frontend, data
          engineering and system design. Each case study explains the problem,
          design decisions, implementation and key takeaways.
        </p>

        <div className="mt-8">
          <TechStackRow />
        </div>
      </div>
    </section>
  );
}
