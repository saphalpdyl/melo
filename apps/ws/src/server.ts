import type * as Party from "partykit/server";

import BasePartyServer from "@/ws/core/server-base";
import { WebSocketEvents } from "@melo/common/constants";

import type { PlayerData } from "@melo/types";

export default class Server extends BasePartyServer implements Party.Server {
  private users = new Map<string, PlayerData>();

  private handleOnClose(connection: Party.Connection) {
    this.emitAll(WebSocketEvents.USER_LEFT, {
      id: connection.id,
    });

    if(this.users.has(connection.id)) {
      // If has remove
      this.users.delete(connection.id);
    }

    this.emitAll(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
      data: Object.fromEntries(this.users),
    });
  }
  
  constructor(readonly room: Party.Room) {
    super(room);

    /** USER CONNECTION HANDLER */
    this.on(WebSocketEvents.USER_CONNECT, (data, sender) => {
      const {
        auth_uid,
      }: {
        auth_uid: string,
      } = data;
      
        // Assign position
      if(!this.users.has(sender.id)){
        // Add to the hash map the user data
        this.users.set(sender.id, {
          auth_uid,
          connectionId: sender.id,
          username: "User" + Math.floor(Math.random() * 1000),
          displayName: "User" + Math.floor(Math.random() * 1000),
          position: [0,0,0],
          rotation: [0,0,0],
          video: false,
          audio: false,
          streamStatus: "configure",
        })
      }

      this.emitAll(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
        data: Object.fromEntries(this.users),
      });
      
      this.emitWithout(WebSocketEvents.USER_JOINED, {
        id: sender.id,
      }, [sender.id]);

      this.emitTo(WebSocketEvents.EXISTING_USERS, {
        "users": this.getConnectionIds([sender.id]),
      }, [sender.id]);
    });
    /** USER CONNECTION HANDLER */
    
    /** USER DIS-CONNECTION HANDLER */
    this.on(WebSocketEvents.USER_DISCONNECT, (_, conn) => {
      this.handleOnClose(conn);
    })
    /** USER DIS-CONNECTION HANDLER */
    
    
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
      this.users.set(conn.id, data);      

      this.emitWithout(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
        data: Object.fromEntries(this.users)
      }, []);
    });

    this.on(WebSocketEvents.SET_STREAM_PROPERTIES, (data, conn) => {
      
      const previousData = this.users.get(conn.id);
      if (!previousData) return console.error(`User with id ${conn.id} not found`);

      this.users.set(conn.id, {
        ...this.users.get(conn.id)!,
        video: "video" in data ? data.video : previousData.video,
        audio: "audio" in data ? data.audio : previousData.audio,
        streamStatus: "streamStatus" in data ? data.streamStatus : previousData.streamStatus,
      });      

      this.emitAll(WebSocketEvents.GLOBAL_PLAYER_DATA_UPDATE, {
        data: Object.fromEntries(this.users)
      });
    });
  }

  onClose(connection: Party.Connection): void | Promise<void> {
    // Delegated to a custom handler that can be called by an event too
    this.handleOnClose(connection);
  };

  onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): void | Promise<void> {
    // Connect logic has been delegated to the USER_CONNECT event to wait for auth id in the payload
  }
}

Server satisfies Party.Worker;