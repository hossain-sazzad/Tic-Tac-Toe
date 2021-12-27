import React from 'react'

export default function PlayAgain({end, onClick}) {
    return (
        <div className='again-container'>
            <button className='btn btn-primary' onClick={onClick} style={{visibility: end?'visible':'hidden'}}>Play Again</button>
        </div>
    )
}
