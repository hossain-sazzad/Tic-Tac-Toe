import React from 'react'
import Score from './Score'

export default function ScoreBoard({data}) {
    return (
        <div className='score-board'>
            <h1 className="score-title">Score Board</h1>
            <Score name={data.you[0]} score={data.you[1]}/>
            <Score name={data.opponent[0]} score={data.opponent[1]}/>
        </div>
    )
}
