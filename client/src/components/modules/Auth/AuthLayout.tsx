import { Star } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-canvas-soft lg:block">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary-pale blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="size-3 rounded-full bg-primary" />
            <span className="font-heading text-2xl font-extrabold tracking-tight text-ink">
              Learnova
            </span>
          </Link>

          <div>
            <h2 className="font-heading text-4xl font-black leading-[0.95] tracking-tight text-ink">
              Learn skills that
              <br />
              move your career forward.
            </h2>
            <p className="mt-5 max-w-md text-lg text-body-text">
              Join thousands of learners mastering new skills with expert-led
              courses.
            </p>

            <div className="mt-10 max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-ink/5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-body-text">
                &ldquo;Learnova changed how I approach learning. The courses
                are practical, clear, and actually fun.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary-pale font-heading text-sm font-extrabold text-ink-deep">
                  RD
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Riley Dunn</p>
                  <p className="text-xs text-mute-text">
                    Data analyst · Learnova learner
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-body-text">
            <span>50+ courses</span>
            <span>10k+ learners</span>
            <span>4.8 rating</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
