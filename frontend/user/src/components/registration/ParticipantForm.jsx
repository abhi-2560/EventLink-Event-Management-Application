import {
    useFieldArray,
    useForm,
} from "react-hook-form";

import Button from "../common/Button";

export default function ParticipantForm({
    maxParticipants,
    onNext,
}) {

    const {
        register,
        handleSubmit,
        control,
    } = useForm({

        defaultValues: {

            participants: [
                {
                    name: "",
                    age: "",
                    gender: "",
                },
            ],

        },

    });

    const {
        fields,
        append,
        remove,
    } = useFieldArray({

        control,

        name: "participants",

    });

    function submit(data) {
        onNext(data.participants);
    }

    return (

        <form
            onSubmit={handleSubmit(
                submit
            )}
        >

            {fields.map((field, index) => (

                <div
                    key={field.id}
                    className="mb-6 rounded-lg border p-5"
                >

                    <input
                        {...register(
                            `participants.${index}.name`
                        )}
                        placeholder="Participant Name"
                        className="mb-3 w-full rounded border p-3"
                    />

                    <input
                        {...register(
                            `participants.${index}.age`
                        )}
                        placeholder="Age"
                        className="mb-3 w-full rounded border p-3"
                    />

                    <select
                        {...register(
                            `participants.${index}.gender`
                        )}
                        className="w-full rounded border p-3"
                    >

                        <option value="">
                            Select Gender
                        </option>

                        <option>
                            Male
                        </option>

                        <option>
                            Female
                        </option>

                        <option>
                            Other
                        </option>

                    </select>

                    {fields.length > 1 && (

                        <button
                            type="button"
                            onClick={() =>
                                remove(index)
                            }
                            className="mt-4 text-red-600"
                        >
                            Remove
                        </button>

                    )}

                </div>

            ))}

            {fields.length <
                maxParticipants && (

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        append({
                            name: "",
                            age: "",
                            gender: "",
                        })
                    }
                >
                    Add Participant
                </Button>

            )}

            <Button
                className="ml-3"
                type="submit"
            >
                Continue
            </Button>

        </form>

    );

}