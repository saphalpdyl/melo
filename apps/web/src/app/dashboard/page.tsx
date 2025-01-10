import { Separator } from "@melo/ui/ui/separator";
import { Switch } from "@melo/ui/ui/switch";
import { DoorClosed, Phone } from "lucide-react";

export default function DashboardPage() {

  return (
      <div className="h-full w-full flex flex-col items-center gap-4">
        <div className="flex h-full w-full xl:max-w-[70%] xl:min-w-[60%] p-4">
          <div className="flex-[2]">
            <h2 className="text-xl inline-flex items-center gap-2 text-blue-500">
              <DoorClosed />
              Public Rooms
            </h2>
          </div>
          <Separator orientation="vertical" className="mx-6"/>
          <div className="flex-[1]">
          <h2 className="text-xl inline-flex items-center gap-2 text-rose-500">
              <Phone />
              Call History
            </h2>
          </div>
        </div>
    </div>
  );
}

