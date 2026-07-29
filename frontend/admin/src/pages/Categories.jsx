import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tags, Plus } from 'lucide-react';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getCategories, createCategory, updateCategory, archiveCategory } from '../api/adminApi';
import { categorySchema } from '../schemas/adminSchemas';
import { DEFAULT_CATEGORIES } from '../utils/helpers';
import { showError, showSuccess } from '../utils/toast';

export default function Categories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin-categories'], queryFn: getCategories });

  const createForm = useForm({ resolver: zodResolver(categorySchema), defaultValues: { name: '', description: '', is_default: false } });
  const editForm = useForm({ resolver: zodResolver(categorySchema) });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setCreating(false);
      createForm.reset();
      showSuccess('Category created');
    },
    onError: showError,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditing(null);
      showSuccess('Category updated');
    },
    onError: showError,
  });

  const archiveMut = useMutation({
    mutationFn: (id) => archiveCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setArchiveTarget(null);
      showSuccess('Category archived');
    },
    onError: showError,
  });

  const startEdit = (cat) => {
    setEditing(cat.category_id);
    editForm.reset({ name: cat.name, description: cat.description || '', is_default: cat.is_default });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-sm text-muted">Default: {DEFAULT_CATEGORIES.join(', ')}. Custom categories for non-default event types use &quot;Other&quot;.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Create Category</Button>
      </div>

      {isError && <p className="text-sm text-danger">{error.message}</p>}

      {creating && (
        <form onSubmit={createForm.handleSubmit((d) => createMut.mutate(d))} className="space-y-3 rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">New Category</h3>
          <Input label="Name" required {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
          <Textarea label="Description" {...createForm.register('description')} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...createForm.register('is_default')} />Default category</label>
          <div className="flex gap-2">
            <Button type="submit" loading={createMut.isPending}>Create</Button>
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {!data?.length ? (
        <EmptyState icon={Tags} title="No categories" description="Create default categories to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((cat) => (
            <div key={cat.category_id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
              {editing === cat.category_id ? (
                <form onSubmit={editForm.handleSubmit((d) => updateMut.mutate({ id: cat.category_id, payload: d }))} className="space-y-2">
                  <Input {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
                  <Textarea {...editForm.register('description')} />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" loading={updateMut.isPending}>Save</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{cat.name}</h3>
                    {cat.is_default && <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-accent">DEFAULT</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{cat.description || '—'}</p>
                  <p className="mt-2 text-xs text-muted">{cat.total_events ?? 0} events</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-danger" onClick={() => setArchiveTarget(cat)}>Archive</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={Boolean(archiveTarget)} title="Archive category?" message={`Archive "${archiveTarget?.name}"?`}
        loading={archiveMut.isPending} onConfirm={() => archiveMut.mutate(archiveTarget.category_id)} onCancel={() => setArchiveTarget(null)} />
    </div>
  );
}
