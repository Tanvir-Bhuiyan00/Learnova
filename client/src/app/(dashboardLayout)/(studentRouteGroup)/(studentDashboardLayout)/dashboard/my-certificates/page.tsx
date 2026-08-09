"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyCertificates } from "@/services/certificate.services";
import { ICertificate } from "@/types/certificate.types";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";

const MyCertificatesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => getMyCertificates(),
  });

  const certificates: ICertificate[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Certificates</h1>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : certificates.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <Award className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="text-sm text-muted-foreground">Complete courses to earn certificates.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardHeader><CardTitle className="text-base">Certificate</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Course: {cert.courseId.slice(0, 8)}...</p>
                <p className="text-xs text-muted-foreground">{new Date(cert.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificatesPage;
