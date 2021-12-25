import React, { useState } from 'react';
import { useHistory } from "react-router-dom";


function App() {    
    const [room, setRoom] = useState('')
    let history = useHistory()
    const enterGame = () =>{
      console.log(room)
      var url = "/"+room
      history.push(url)
    }
    return (
      <div className = "MyApp">
        <h1> Tic-Tac-Toe </h1>
        <br></br>
        <br></br>
        <label htmlFor = "title" className = "form-label">Room Name</label>
        <input type = "text" className = "form-control" id = "roomName" placeholder = "add room name here"
          value = {room} onChange = {e => setRoom(e.target.value)
        }
        />
        <button className = "btn btn-success mt-3"
        onClick = {enterGame}>Join</button>    
        
      </div>
    );
  }

export default App;
