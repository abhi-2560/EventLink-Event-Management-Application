import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';

interface ParticipantFormValues {
  participants: { name: string }[];
}

export default function ParticipantForm({ maxSeats }: { maxSeats: number }) {
  const { register, control, formState: { errors } } = useFormContext<ParticipantFormValues>();
  const { fields, append, remove } = useFieldArray<ParticipantFormValues>({ control, name: 'participants' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
        {fields.length < maxSeats && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ name: '' })}
          >
            <Plus className="h-4 w-4" />
            Add participant
          </Button>
        )}
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-3">
          <div className="flex-1">
            <Input
              label={`Participant ${index + 1}`}
              placeholder="Full name"
              {...register(`participants.${index}.name`)}
              error={errors.participants?.[index]?.name?.message}
            />
          </div>
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-7 text-danger"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
