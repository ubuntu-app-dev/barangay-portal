import { CheckIcon } from "@/components/icons/icon";
import { container, heading2 } from "@/lib/styles";
import { privacyPrinciples } from "@/data/landing-content";

export default function DataPrivacy() {
  return (
    <section id="privacy" className="py-16 md:py-20">
      <div
        className={`${container} grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-14`}
      >
        <div>
          <h2 className={heading2}>Planned around the Data Privacy Act</h2>
          <p className="mt-4 max-w-[48ch] text-ink-secondary">
            Resident records are personal information. The system is planned
            around the principles of Republic Act No. 10173, the Data Privacy
            Act of 2012.
          </p>
        </div>
        <ul className="grid gap-x-8 gap-y-6 min-[481px]:grid-cols-2">
          {privacyPrinciples.map((p) => (
            <li key={p.title} className="flex gap-2 border-t border-rule pt-4">
              <CheckIcon />
              <div>
                <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
                  {p.title}
                </h3>
                <p className="mt-1 text-[15px] text-ink-secondary">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
