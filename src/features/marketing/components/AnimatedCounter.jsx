import CountUp from 'react-countup';
import { useInView } from './useInView';

export default function AnimatedCounter({ end = 0, suffix = '', label, duration = 2 }) {
  const [ref, inView] = useInView({ threshold: 0.3 });

  return (
    <div ref={ref} className="ce-stat-card text-center">
      <div className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
        {inView ? (
          <>
            <CountUp end={end} duration={duration} separator="," />
            {suffix}
          </>
        ) : (
          <>0{suffix}</>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>
    </div>
  );
}
