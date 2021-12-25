"""
ASGI config for TTTBackend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import path
from TicTacToe.consumer import GameRoom

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TTTBackend.settings')

application = get_asgi_application()

ws_pattern = [
    path('ws/game/<room_code>', GameRoom),
]
application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(URLRouter(ws_pattern))
})
