### Informacje o grze
##### Statki
Długość i szerokość na planszy `100px x 100px` (a więc wartości w %)

| Nazwa       | Wartość | Długość | Szerokość |
|-------------|:-------:|:-------:|:---------:|
| Carrier     |    5    |   20px  |    5px    |
| Battleship  |    4    |   18px  |    4px    |
| Destroyer   |    3    |   14px  |    5px    |
| Submarine   |    3    |   10px  |    4px    |
| Patrol Boat |    2    |   6px   |    3px    |

### Obsługa eventów (`socket.io`)

##### Fazy gry
Status o aktualnej fazie gry jest wysyłany na kanał `game-status`:
- `CREATED` - po utworzeniu gry przez jednego z graczy
- `SETUP` - po dołączeniu do gry drugiego zawodnika
- `ACTIVE` - po ustawieniu wszystkich 10 statków na planszy (5 na każdego zawodnika)
- `FINISHED` - po zbiciu wszystkich statków jednego z graczy (_w fazie implementacji_)

##### Rozpoczęcie rozgrywki
- Tworzenie pokoju do gry (jeśli użytkownik nie jest w żadnym pokoju)
    ```
    socket.emit('create-game', { name: <GAME_NAME> })
    ```
    
    ```    
    socket.on('message')  
  
    {
      "gameId": <GAME_ID>,
      "gameName" <GAME_NAME>,
      "message": "Utworzyłeś nową gre"
    }
    ```

- Dołączenie do istniejącego pokoju (jeśli użytkownik nie jest w żadnym pokoju)
    ```
    socket.emit('join-game', { id: <GAME_ID> })
    ```
    
    ```
    socket.on('message')    
  
    {
      "gameId": <GAME_ID>,
      "gameName" <GAME_NAME>,
      "message": "Dołączyłeś do gry!", 
      "players": [<PLAYER_1_ID>, <PLAYER_2_ID>]
    }
    ```
  
  Jeśli jeden z uczestników gry w danym pokoju straci połączenie, drugi gracz automatycznie zostanie rozłączony.
  
  
##### Ustawianie statków

```
socket.emit('set-ship',
    {
        shipType: <SHIP_NAME (lowercase)>,
        location_x: [0.0, 1.0],
        location_y: [0.0, 1.0]
    })
```
###### Walidacja
- Jeśli wysłany statek nie mieści się na planszy:
    ```
    "message": "Statek nie mieści się na planszy gry"
    ```
- Jeśli lokalizacja wysłanego statku jest zajęta (pokrycie się z istniejącymi):
    ```
    "message": "W tym miejscu jest już inny statek"
    ```
   
```
socket.on('set-ship')

{
    "message": "Statek (<SHIP_NAME>) utworzony!",
    "currentShips": [
        {
            "name": <SHIP_NAME>,
            "x": <X>,
            "y": <Y>
        },
        ...
    ]
}
```

##### Zbijanie statków

```
socket.emit('shoot',
    {
        location_x: [0.0, 1.0],
        location_y: [0.0, 1.0]
    })
```
    
- Strzał udany
    ```
    socket.on('shoot')
    
    {
        "message": "Strzał udany!",
        "ship": <SHIP_NAME>,
        "shipStatus": <SHIP_STATUS [live, sunk]>,
        "damage": <SHOOT_DAMAGE>
    }
    ```
- Strzał udany - state przeciwnika zatopiony
    ```
    socket.on('shoot')
    
    {
        "message": "Zatopiłeś statek przeciwnika!",
        "ship": <SHIP_NAME>,
        "shipStatus": <SHIP_STATUS [live, sunk]>,
        "damage": <SHOOT_DAMAGE>
    }
    ```
    
- Strzał chybiony
    ```
    socket.on('shoot')
    
    {
        "message": "Strzał chybiony!",
        "ship": null,
        "shipStatus": null,
        "damage": null
    }
    ```
  
