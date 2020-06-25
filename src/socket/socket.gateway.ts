import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ValidationPipe } from '../pipes/validation.pipe';
import { EventTypes } from '../events/event.types';
import { CreateGameMessage } from '../events/messages/CreateGame.message';
import { JoinGameMessage } from '../events/messages/JoinGame.message';
import { GameService } from '../services/game.service';
import { PlayerService } from '../services/player.service';
import { SocketService } from '../services/socket.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private socketService: SocketService,
    private gameService: GameService,
    private playerService: PlayerService
  ) {}

  @WebSocketServer()
  protected server: Server;

  handleConnection(client: Socket): any {
    this.socketService.handleConnection(client);
  }

  handleDisconnect(client: Socket): any {
    this.socketService.handleDisconnect(client);
  }

  @SubscribeMessage(EventTypes.CREATE_GAME)
  handleCreateGameEvent(@MessageBody(ValidationPipe) data: CreateGameMessage, @ConnectedSocket() client: Socket): any {
    this.gameService.createGame(client, data.name);
  }

  @SubscribeMessage(EventTypes.JOIN_GAME)
  handleJoinGameEvent(@MessageBody(ValidationPipe) data: JoinGameMessage, @ConnectedSocket() client: Socket): any {
    this.gameService.joinToGame(client, data.id);
  }



  @SubscribeMessage(EventTypes.DEBUG)
  handleTestEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket): any {
    this.gameService.debug(client);
    this.playerService.debug(client);
  }
}
