import { SeriesForm } from '@/app/admin/(protected)/series/_components/series-form';

export default function NewSeriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New series</h1>
      <SeriesForm />
    </div>
  );
}
