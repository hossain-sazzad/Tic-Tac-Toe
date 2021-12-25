import json

import channels
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class GameRoom(WebsocketConsumer):
    present = set()
    def connect(self):
        self.turn = 0
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = "room_%s" % self.room_name
        print(self.room_group_name)
        if(self.present.__contains__(self.room_group_name)):
            playerNo = 2
        else:
            playerNo = 1
            self.present.add(self.room_group_name)

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

    def receive(self, text_data):
        data = json.loads(text_data)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,{
                'type': 'updateState',
                'index': data['index'],
                'playerNo': data['playerNo']
            }
        )

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
