import { usePlayers } from "@/web/components/room/components/context-providers/players";
import { useAuthStore } from "@/web/store/auth";
import useGlobalStore from "@/web/store/global";
import usePlayerStore from "@/web/store/players";
import useSceneStore from "@/web/store/scene";
import { WebSocketEvents } from "@melo/common/constants";
import type { ZoneTransferObjectProps, ZoneTransferRequest, ZoneTransferResponse } from "@melo/types";
import { Button } from "@melo/ui/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@melo/ui/ui/tooltip";
import { Html } from "@react-three/drei";
import { DoorClosed, DoorOpen } from "lucide-react";
import { useEffect } from "react";
import { type Object3D } from "three";
import { v4 as uuidv4 } from "uuid";

export default function TransferZones() {
  // What are transfer zones?
  // Transfer zones are the doors that connect rooms together.
  // They are invisible and are used to teleport players between rooms.
  
  const { socket } = useGlobalStore();
  const { auth } = useAuthStore();
  const { transferZones, playerCurrentTransferZone } = useSceneStore();
  const { handleZoneAndPositionChange } = usePlayers();
  const { players } = usePlayerStore();

  useEffect(() => {
    // socket?.on(WebSocketEvents.ZONE_TRANSFER_REQUEST, (data: any) => {
    //   // const transferRequest = data.request as ZoneTransferRequest;
      
    // });
    if ( socket?.isRegistered(WebSocketEvents.ZONE_TRANSFER_RESPONSE) ) return;
    
    socket?.on(WebSocketEvents.ZONE_TRANSFER_RESPONSE, (data: any) => {
      const response = data.response as ZoneTransferResponse;

      const fromZoneProps = useSceneStore.getState().transferZones.find(zone => zone.userData.zone_identifier === response.transferRequest.zoneIdentifier.from)?.userData as ZoneTransferObjectProps | null;

      if (!fromZoneProps) return console.error("ERROR: Zone props not found");

      handleZoneAndPositionChange(response.transferRequest.zone.to, [fromZoneProps.target_pos_x, fromZoneProps.target_pos_z, -fromZoneProps.target_pos_y]);  
    });
  }, []);
  
  const handleKnock = (isIntersecting: boolean, transferZone: Object3D) => {
    if (!isIntersecting || !socket || !(auth?.status === "auth") || !auth.user) return;

    const transferZoneProps = transferZone.userData as ZoneTransferObjectProps;

    // Emit a knock request to the server
    socket?.emit(WebSocketEvents.ZONE_TRANSFER_REQUEST, {
      request: {
        requestFrom:auth.user.uid,
        requestId: uuidv4(),
        timestamp: Date.now(),
        zoneIdentifier: {
          from: transferZone.userData.zone_identifier,
          to: transferZoneProps.target_zone_identifier,
        },
        zone: {
          from: transferZoneProps.zone_name,
          to: transferZoneProps.target_zone_name,
        },
        goToPublic: transferZoneProps.is_to_public,
      } satisfies ZoneTransferRequest
    });
  }
  
  // TODO: Delete the transfer zone's original placeholder child
  return transferZones.map(placeholder => {
    const isIntersecting = playerCurrentTransferZone?.userData.zone_identifier === placeholder.userData.zone_identifier;
    const zoneData = placeholder.userData as ZoneTransferObjectProps;

    // Find if someone is in the target zone
    const playerInTargetZone = players.find(player => player.zone === zoneData.target_zone_name);
    const buttonTooltip = zoneData.is_to_public ? "Leave" : playerInTargetZone ? "Knock" : "Enter";

    return <mesh
      key={placeholder.userData.zone_identifier}
      position={placeholder.position}
      rotation={placeholder.rotation}
    >
      <Html>
        {
          isIntersecting && (
            <span className="absolute -left-[32px] w-[80px] h-[48px] rounded-lg -translate-x-1/2 -top-12">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={(e) => {
                      e.stopPropagation();
                      handleKnock(isIntersecting, placeholder);
                    }} className="bg-blue-500 hover:bg-blue-600">
                      {
                        playerInTargetZone ? <DoorClosed /> : <DoorOpen />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    { buttonTooltip }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          )
        }
      </Html>
    </mesh>
  })
}