// import Wait from '../functional/Wait'
// import Status from '../functional/Status'
// import ScoreBoard from '../functional/ScoreBoard'
// import PlayAgain from '../functional/PlayAgain'
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { w3cwebsocket } from 'websocket';
import PlayAgain from '../functional/PlayAgain';
import ScoreBoard from '../functional/ScoreBoard';
import Square from '../functional/Square';
import Status from '../functional/Status';

var baseUrl = 'ws://127.0.0.1:8000/ws/game/'
var client;
var url;
class Board extends Component {
  constructor(props){
    super(props)
    console.log("in constructor")
    console.log("Board "+ props.room)

    url = baseUrl + props.room
    // client = new w3cwebsocket(url);
    this.state = {
      game: new Array(9).fill(null),
      piece: '',
      turn: true,
      end: false,
      room: '',
      statusMessage: '',
      currentPlayerScore: 0,
      opponentPlayerScore: 0,
      //State to check when a new user join
      waiting: false,
      joinError: false
    }
    this.socketID = null
    this.componentDidMount.bind(this)
    this.onClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    console.log("mounted " + url)
    client = new w3cwebsocket(url);
    const _self = this;
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      console.log(this.state.piece)
    };
    client.onerror = function(event){
      console.log("got error")
      _self.setState({"statusMessage": "Room is closed"})
    }
    client.onclose = function(event) {
      console.log("closing connection")
      _self.setState({"statusMessage": "Room is closed"})
    }
    client.onmessage = function(event) {
      var jsonObject = JSON.parse(event.data);
      console.log(event.data)
      var type = jsonObject['payload']['type']
      console.log("type "+ type)
      if (type === 'initiate'){
        if(_self.state.piece  === ''){
            var playerNo = jsonObject['payload']['playerNo']
            console.log("player no "+ playerNo)
            if(playerNo === 0){
              _self.setState({"piece": ""})
              console.log("room filled")
              _self.setState({"statusMessage": "Soory, There are already 2 players in this room. Try another room"})
            }
            else if(playerNo === 1){
              _self.setState({"piece": "X"})
              console.log(_self.state.piece)
              _self.setState({"turn": true})
              _self.setState({"statusMessage": "Your turn"})
            } else {
              _self.setState({"piece": "O"})
              _self.setState({"turn": false})
              console.log(_self.state.piece)
              _self.setState({"statusMessage": "Opponent's turn"})
            }
        }
      } else if (type === 'discard'){
        _self.setState({"statusMessage": "opponent player left", "end": true, "piece": ''})
      } else if (type === 'restart'){
        _self.gameReStart()
      } else {
        var index = jsonObject['payload']['index']
        var board = jsonObject['payload']['board']
        playerNo = jsonObject['payload']['playerNo']
        var win = jsonObject['payload']['win']
        var end = jsonObject['payload']['end']
        var score1 = jsonObject['payload']['score1']
        var score2 = jsonObject['payload']['score2']

        console.log(index)
        console.log("received "+ index)
        console.log(_self.state.piece)
        console.log(board)
        _self.handleUpdate(playerNo, board)

        if(win){
          _self.handleWin(playerNo, score1, score2)
        } else if (end){
          _self.setState({"statusMessage": "Game Over"})
          _self.setState({end:true})
        } else {
          var thisPlayer =  _self.state.piece === 'X'?1 :2;
          if(playerNo !== thisPlayer){
            _self.setState({"statusMessage": "Your turn"})
          } else {
            _self.setState({"statusMessage": "Opponent's turn"})
          }
        }
      }
   }    
  }

  //Setting the states to start a game when new user join
  gameReStart(){
    var playerNo =  this.state.piece === 'X'?1 :2;
    if(playerNo === 1){
      this.setState({
        "game": new Array(9).fill(null),
        "statusMessage": "Your turn",
        "turn": true,
        "end": false,
        "win": false})
    } else {
      this.setState({
        "game": new Array(9).fill(null),
      "statusMessage": "Opponent's turn", 
      "turn": false,
      "end": false,
      "win": false})
    }
  }

  //When some one make a move, emit the event to the back end for handling
  handleClick = (index) => {
    if(this.state.turn){
      const {game, piece, end, turn} = this.state
      if (!game[index] && !end){
        client.send(JSON.stringify({"index": index, 
        "playerNo": this.state.piece==='X'? 1: 2,
        "board": game}))
      }
      this.setState({"turn": false})
    }
  }

  playAgainRequest = () => {
    client.send(JSON.stringify({"event": "reload"}))
  }
  //Setting the states each move when the game haven't ended (no wins or draw)
  handleUpdate(playerNo, updatedGame){
    var thisPlayer = this.state.piece === 'X'?1 :2;
    if(playerNo !== thisPlayer){
      this.setState({"turn": true})
    }
    this.setState({game:updatedGame})
  }

  //Setting the states when some one wins
  handleWin(playerNo, score1, score2) {
    this.setState({"turn": false})
    var thisPlayer = this.state.piece === 'X'?1 :2;
    var thisPlayerScore = this.state.piece === 'X'?score1 :score2;
    var opponentPlayerScore = this.state.piece === 'X'?score2 :score1;

    if(playerNo !== thisPlayer){
      this.setState({"statusMessage": "Sorry, You lost"})
      this.setState({"opponentPlayerScore": opponentPlayerScore})
    } else {
      this.setState({"statusMessage": "Congrats!, You won"})
      this.setState({"currentPlayerScore": thisPlayerScore})
    }
    this.setState({end:true})
  }

  //Setting the states when there is a draw at the end
  handleDraw(gameState){
    this.setBoard(gameState)
    this.setState({end:true, statusMessage:'Draw'})
  }

  //Handle the restart event from the back end
  handleRestart(gameState, turn){
    this.setBoard(gameState)
    this.setTurn(turn)
    this.setMessage()
    this.setState({end: false})
  }

  //Some utilities methods to set the states of the board

  setMessage(){
    const message = this.state.turn?'Your Turn':`${this.state.opponentPlayer[0]}'s Turn`
    this.setState({statusMessage:message})
  }

  setTurn(turn){
    if (this.state.piece === turn){
      this.setState({turn:true})
    }else{
      this.setState({turn:false})
    }
  } 

  setBoard(gameState){
    this.setState({game:gameState})
  }
  
  renderSquare(i){
    return(
      <Square key={i} value={this.state.game[i]} 
                              player={this.state.piece} 
                              end={this.state.end} 
                              id={i} 
                              onClick={this.onClick}
                              turn={this.state.turn}/> 
    )
  }

  render(){
    if (this.state.joinError){
      return(
        <Redirect to={`/`} />
      )
    }else{
      const squareArray = []
      for (let i=0; i<9; i++){
        const newSquare = this.renderSquare(i)
        squareArray.push(newSquare)
      }
      return(
        <>
        <div className = "MyApp">
        <Status message={this.state.statusMessage}/>
         {this.state.piece === ''? null : (
            <div>
            <div className="board">
            {squareArray}
            </div>
             <ScoreBoard data={{you:['You', this.state.currentPlayerScore], opponent:['Opponent', this.state.opponentPlayerScore]}}/>
             <PlayAgain end={this.state.end} onClick={this.playAgainRequest}/>
            </div>

          )
        }
        </div>
        </>
      )
    }
  }
}


export default Board



