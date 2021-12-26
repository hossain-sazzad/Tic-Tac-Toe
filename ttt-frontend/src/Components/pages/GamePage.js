import React from 'react'
import { useParams } from 'react-router'
import Board from './Board'

export default function GamePage() {
    const {room} = useParams()
    return (
        <div className = "MyApp">
            <Board room = {room}></Board>
        </div>
    )
}
