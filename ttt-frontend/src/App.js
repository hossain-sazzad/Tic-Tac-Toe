import { encode as base64_encode } from 'base-64';
import { Buffer } from 'buffer';
import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

function App() {    
    const [room, setRoom] = useState('')
    const [link, setLink] = useState(null)

    let history = useHistory()

    function getHash(str){
      let encoded = base64_encode(Buffer.from(str))
      console.log("hash "+ encoded)
      return encoded
    }
    const enterGame = () =>{
      console.log("hash "+ getHash(room))
      var url = "/"+getHash(room)
      history.push(url)
    }
    

    const generateLink = () =>{
      setLink("http://localhost:3000/"+getHash(room))
    }
    return (
      <div className = "MyApp">
        <h1> Tic-Tac-Toe </h1>
        <br></br>
        <br></br>
        <label htmlFor = "title" className = "form-label">Room Name</label>
        <input type = "text" className = "form-control input-lg" id = "roomName" placeholder = "add room name here"
          value = {room} onChange = {e => setRoom(e.target.value)
        }
        />
        <button className = "btn btn-success mt-3"
        onClick = {enterGame}>Join</button>         
        <button className = "btn btn-success mt-3"
        onClick = {generateLink}>Generate Link</button>    
        {
          link === null? null : (
            <div >
              <a href={link} className="link-primary">{link}</a>
            </div>
          )
        }   
      </div>
    );
  }

export default App;
