import { Provider, Status } from "@/generated/prisma/enums";
import { Badge } from "./badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cloud,
  Laptop,
  Loader2,
} from "lucide-react";

// Helper to get status colors and icons
export const getStatusBadge = (status: Status) => {
  switch (status) {
    case Status.ACTIVE:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-green-200 bg-green-50 text-green-700"
        >
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
      );
    case Status.PROVISIONING:
      return (
        <Badge
          variant="outline"
          className="animate-pulse gap-1 border-blue-200 bg-blue-50 text-blue-700"
        >
          <Loader2 className="h-3 w-3 animate-spin" /> Provisioning
        </Badge>
      );
    case Status.FAILED:
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" /> Failed
        </Badge>
      );
    case Status.PENDING:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getProviderIcon = (provider: Provider) => {
  switch (provider) {
    case Provider.AWS:
      return <Cloud className="h-4 w-4 text-orange-500" />;
    case Provider.GCP:
      return <Cloud className="h-4 w-4 text-blue-500" />;
    case Provider.EDGE:
      return <Laptop className="h-4 w-4 text-purple-500" />;
  }
};
