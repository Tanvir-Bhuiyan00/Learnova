"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getMyCertificates } from "@/services/certificate.services";
import { ICertificate } from "@/types/certificate.types";
import { useQuery } from "@tanstack/react-query";
import { Award, Download } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

const MyCertificatesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => getMyCertificates(),
  });

  const certificates: ICertificate[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          My certificates
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Proof of everything you have completed.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group flex flex-col rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
                  <Award className="size-6 text-ink" />
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-canvas-soft text-mute-text transition-colors group-hover:bg-ink-solid group-hover:text-white">
                  <Download className="size-4" />
                </span>
              </div>
              <h3 className="mt-5 font-heading text-lg font-bold text-ink">
                Certificate of completion
              </h3>
              <p className="mt-1 text-sm text-mute-text">
                Course {cert.courseId.slice(0, 8)}...
              </p>
              <p className="mt-auto pt-4 text-xs text-mute-text">
                Earned on {new Date(cert.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificatesPage;
