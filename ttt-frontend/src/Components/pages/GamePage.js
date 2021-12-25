import React from 'react'
import { useParams } from 'react-router'
import Board from './Board'

export default function GamePage() {
    const {room} = useParams()
    return (
        <div className = "MyApp">
                    <h1> Tic-Tac-Toe </h1>
        <br></br>
        <br></br>
            <Board room = {room}></Board>
        </div>
    )
}
