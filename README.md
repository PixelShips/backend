### Informacje o grze
##### Statki
Długość i szerokość na planszy `100px x 100px` (a więc wartośći w %)

| Nazwa       | Wartość | Długość | Szerokość | Ilość |
|-------------|:-------:|:-------:|:---------:|:-----:|
| Carrier     |    5    |   20px  |    5px    |   1   |
| Battleship  |    4    |   18px  |    4px    |   1   |
| Destroyer   |    3    |   14px  |    5px    |   2   |
| Submarine   |    3    |   10px  |    4px    |   2   |
| Patrol Boat |    2    |   6px   |    3px    |   4   |

### Obsługa eventów (`socket.io`)
##### Rozpoczęcie rozgrywki
- Tworzenie pokoju do gry (jeśli użytkownik nie jest w żadnym pokoju)
    ```
    socket.emit('create-room')
    ```
    
    ```    
    socket.on('message')  
  
    {
      "gameId": <GAME_ID>,
      "message": "Game created!"
    }
    ```

- Dołączenie do istniejącego pokoju (jeśli użytkownik nie jest w żadnym pokoju)
    ```
    socket.emit('join-room', { id: <GAME_ID> })
    ```
    
    ```
    socket.on('message')    
  
    {
      "gameId": <GAME_ID>,
      "message": "Joined to game!", 
      "players": [<PLAYER_1_ID>, <PLAYER_2_ID>]
    }
    ```
  
  Jeśli jeden z uczestników gry w danym pokoju straci połączenie, drugi gracz automatycznie zostanie rozłączony.