import {
    useForm,
} from "react-hook-form";

import Button from "../common/Button";

export default function ContactForm({
    onNext,
}) {

    const {
        register,
        handleSubmit,
    } = useForm();

    return (

        <form
            onSubmit={handleSubmit(
                onNext
            )}
            className="space-y-5"
        >

            <input
                {...register("name")}
                placeholder="Full Name"
                className="w-full rounded border p-3"
            />

            <input
                {...register("email")}
                placeholder="Email"
                className="w-full rounded border p-3"
            />

            <input
                {...register("phone")}
                placeholder="Phone"
                className="w-full rounded border p-3"
            />

            <Button type="submit">
                Continue
            </Button>

        </form>

    );

}