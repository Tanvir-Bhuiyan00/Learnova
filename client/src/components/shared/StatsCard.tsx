import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { createElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  iconName,
  description,
  className,
}: StatsCardProps) => {
  return (
    <Card
      className={cn(
        "ring-1 ring-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-pale hover:ring-primary/40",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-body-text">
          {title}
        </CardTitle>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-pale text-ink-deep">
          {createElement(getIconComponent(iconName), { className: "size-5" })}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="font-heading text-3xl font-extrabold text-ink">
          {value}
        </div>
        {description && (
          <p className="text-xs font-medium text-mute-text">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
