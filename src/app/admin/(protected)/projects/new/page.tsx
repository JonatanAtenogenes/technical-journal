import { getSeriesOptions } from '@/app/admin/(protected)/projects/data';
import { ProjectForm } from '@/app/admin/(protected)/projects/_components/project-form';

export default async function NewProjectPage() {
  const seriesOptions = await getSeriesOptions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <ProjectForm seriesOptions={seriesOptions} />
    </div>
  );
}
