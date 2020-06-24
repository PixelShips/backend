import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ValidationPipe } from '@nestjs/common';
import { EventTypes } from '../events/event.types';
import { CreateGameMessage } from '../events/messages/CreateGame.message';
import { JoinGameMessage } from '../events/messages/JoinGame.message';
import { GameService } from '../services/game.service';
import { PlayerService } from '../services/player.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private gameService: GameService, private playerService: PlayerService) { }

  @WebSocketServer()
  protected server: Server;

  handleConnection(client: Socket): any {
    this.playerService.create(client);
    client.emit(EventTypes.CONNECT, "CONNECT");
  }

  handleDisconnect(client: Socket): any {
    // @TODO: delete player
    client.emit(EventTypes.DISCONNECT, "DISCONNECT");
  }

  @SubscribeMessage(EventTypes.CREATE_GAME)
  handleCreateGameEvent(@MessageBody(new ValidationPipe()) data: CreateGameMessage, @ConnectedSocket() client: Socket): any {
    const player = this.playerService.getPlayer(client);
    const game = this.gameService.create();
    game.join(player);
    const message = {
      gameId: game.getId(),
      message: "GAME CREATED"
    };
    client.emit(EventTypes.MESSAGE, message)
  }

  @SubscribeMessage(EventTypes.JOIN_GAME)
  handleJoinGameEvent(@MessageBody(new ValidationPipe()) data: JoinGameMessage, @ConnectedSocket() client: Socket): any {
    const player = this.playerService.getPlayer(client);
    const game = this.gameService.getGameById(data.id);
    game.join(player);
    const message = {
      gameId: game.getId(),
      message: "GAME JOINED"
    };
    client.emit(EventTypes.MESSAGE, message)
  }

  @SubscribeMessage(EventTypes.DEBUG)
  handleTestEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket): any {
    const player = this.playerService.getPlayer(client);
    const game = this.gameService.getGameById(player.gameId);
    const message = {
      playerId: player.id,
      playerGameId: player.gameId,
      gamePlayersLength: game.players.length,
      gamePlayers: game.players.map(p => p.id)
    };

    client.emit(EventTypes.MESSAGE, message)
  }

}
