import { CircleAlert, CircleCheck } from "lucide-react";

export type Message = {
  type: "error" | "success";
  text: string;
};

export default function FormMessage({ message }: { message: Message }) {
  const isError = message.type === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <p
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
        isError ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message.text}
    </p>
  );
}
