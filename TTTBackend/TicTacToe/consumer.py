import json

import channels
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class GameRoom(WebsocketConsumer):
    present = dict()
    def connect(self):
        self.turn = 0
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = "room_%s" % self.room_name
        print("room-name "+self.room_group_name)
        print(self.present)
        if(self.room_group_name in self.present):
            # print("size "+ len(self.present[self.room_group_name]))
            if len(self.present[self.room_group_name]) >= 2:
                playerNo = 0
                print("More than 2 player is not allowed")
            else:
                playerNo = 2
                print("player 2 selected")
                self.present[self.room_group_name].append(0)
        else:
            playerNo = 1
            self.present[self.room_group_name] = [0]
            # self.present.add(self.room_group_name)
            print("player 1 selected")

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        ) 
        self.accept()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,{
                'type': 'initiate',
                'playerNo': playerNo
            }
        )

    def disconnect(self):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name  
        )
        self.present.remove(self.room_group_name)

    def checkWin(self,board):
        # rows matched
        if board[0] == board[1] == board[2]:
            if board[0] is not None: return True
        if board[3] == board[4] == board[5]:
            if board[3] is not None: return True
        if board[6] == board[7] == board[8]:
            if board[6] is not None: return True

        # colums matched
        if board[0] == board[3] == board[6]:
            if board[0] is not None: return True
        if board[1] == board[4] == board[7]:
            if board[1] is not None: return True
        if board[2] == board[5] == board[8]:
            if board[2] is not None: return True

        # corners matched
        if board[0] == board[4] == board[8]:
            if board[0] is not None: return True
        if board[2] == board[4] == board[6]:
            if board[2] is not None: return True

        return False

    def isGameOver(self, board):
        for i in range(9):
            if board[i] is None:
                return False
        return True

    def updateGame(self,board, index, playerNo):
        if playerNo == 1:
            board[index] = 'X'
        else:
            board[index] = 'O'
        
        return board

    def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        if "event" in data :
            print("restart triggered")
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,{
                    "type": "restart",
                    'event': "reload"
                }
            )
            return
        
        board = data['board']
        board = self.updateGame(board, data['index'], data['playerNo'])
        win = self.checkWin(board)
        end = True if win else self.isGameOver(board)
        
        if(win):
            self.present[self.room_group_name][data['playerNo']-1] = self.present[self.room_group_name][data['playerNo']-1] + 10
        
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,{
                'type': 'updateState',
                'index': data['index'],
                'playerNo': data['playerNo'],
                'board': board,
                'win': win,
                'end': end,
                'score1': self.present[self.room_group_name][0],
                'score2': self.present[self.room_group_name][1]
            }
        )

    def restart(self, data):
        self.send(text_data= json.dumps({
            'payload': data
        }))
    def updateState(self, data):
        # data = event['payload']
        # print("at updateState")
        # print(data)
        # data = json.loads(data)
        # print(data['index'])
        self.send(text_data= json.dumps({
            'payload': data
        }))

    def initiate(self, data):
        print("at initiate")
        print(data)
        # data = json.loads(data)
        # print(data['index'])
        self.send(text_data= json.dumps({
            'payload': data
        }))



        

        