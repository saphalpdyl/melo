import type * as Party from "partykit/server";

import BasePartyServer from "@/ws/core/server-base";
import { WebSocketEvents } from "@melo/common/constants";

import type { PlayerData } from "@melo/types";

export default class Server extends BasePartyServer implements Party.Server {
  private userData = new Map<string, PlayerData>();
  
  constructor(readonly room: Party.Room) {
    super(room);


    this.on(WebSocketEvents.P2P_OFFER, (data, conn) => {
      // Offer by broadcasting to the specific user only
      this.emitTo(WebSocketEvents.P2P_OFFER,{
        offer: data.offer,
        from: conn.id,
      }, [data.to]);

    });

    this.on(WebSocketEvents.P2P_ANSWER, ({answer, to},conn) => {
      this.emitTo(WebSocketEvents.P2P_ANSWER, {
        answer,
        from: conn.id,
      }, [to])
    });

    this.on(WebSocketEvents.P2P_ICE_CANDIDATE, ({ candidate, to }, conn) => {
      this.emitTo(WebSocketEvents.P2P_ICE_CANDIDATE, {
        candidate,
        from: conn.id,
      }, [to]);
    });

    
    this.on(WebSocketEvents.P2P_DISCONNECT, (_, conn) => {
      this.emitAll(WebSocketEvents.USER_LEFT, {
        id: conn.id,
      });
    });

    this.on(WebSocketEvents.PLAYER_DATA_UPDATE, (data, conn) => {
      // Set the individual player's position and then signal the update to all
      // We are sure that the userData entry is already done
      this.userData.set(conn.id, data);      

      this.emitWithout(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
        data: Object.fromEntries(this.userData)
      }, []);
    })
  }

  onClose(connection: Party.Connection): void | Promise<void> {
    this.emitAll(WebSocketEvents.USER_LEFT, {
      id: connection.id,
    });

    if(this.userData.has(connection.id)) {
      // If has remove
      this.userData.delete(connection.id);
    }

    this.emitAll(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
      data: Object.fromEntries(this.userData),
    });
  };

  onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): void | Promise<void> {
    // Assign position
    if(!this.userData.has(connection.id)){
      // Add to the hash map the user data
      this.userData.set(connection.id, {
        connectionId: connection.id,
        username: "User" + Math.floor(Math.random() * 1000),
        displayName: "User" + Math.floor(Math.random() * 1000),
        position: [0,0,0],
        rotation: [0,0,0],
      })
    }

    this.emitAll(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
      data: Object.fromEntries(this.userData),
    });
    
    this.emitWithout(WebSocketEvents.USER_JOINED, {
      id: connection.id,
    }, [connection.id]);

    this.emitTo(WebSocketEvents.EXISTING_USERS, {
      "users": this.getConnectionIds([connection.id]),
    }, [connection.id]);
  }
}

Server satisfies Party.Worker;