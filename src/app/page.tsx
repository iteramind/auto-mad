import { BLOCKS, QUESTIONS } from "@/lib/questionnaire";
import DiagnosticForm from "@/components/DiagnosticForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <DiagnosticForm blocks={BLOCKS} questions={QUESTIONS} />
    </main>
  );
}
