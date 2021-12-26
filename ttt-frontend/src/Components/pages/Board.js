// import Wait from '../functional/Wait'
// import Status from '../functional/Status'
// import ScoreBoard from '../functional/ScoreBoard'
// import PlayAgain from '../functional/PlayAgain'
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { w3cwebsocket } from 'websocket';
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
      opponentPlayer: [],
      //State to check when a new user join
      waiting: false,
      joinError: false
    }
    this.socketID = null
    this.componentDidMount.bind(this)
    this.onClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    console.log("mounted")
    client = new w3cwebsocket(url);
    const _self = this;
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      console.log(this.state.piece)
      // this.setState({waiting:false})
      // this.gameStart(gameState, players, turn)
    };
    client.onmessage = function(event) {
      var jsonObject = JSON.parse(event.data);
      console.log(event.data)
      var type = jsonObject['payload']['type']
      console.log("type "+ type)
      if (type === 'initiate'){
        if(_self.state.piece  === ''){
            var playerNo = jsonObject['payload']['playerNo']
            console.log("player no "+ playerNo)
            if(playerNo === 1){
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
      } else {
          var index = jsonObject['payload']['index']
          var board = jsonObject['payload']['board']
          playerNo = jsonObject['payload']['playerNo']
          var win = jsonObject['payload']['win']
          var end = jsonObject['payload']['end']
          console.log(index)
          console.log("received "+ index)
          console.log(_self.state.piece)
          console.log(board)
          _self.handleUpdate(playerNo, board)

          if(win){
            _self.handleWin(playerNo)
          } else if (end){
            _self.setState({"statusMessage": "Game Over"})
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
    
    // const {room, name} = qs.parse(window.location.search, {
    //   ignoreQueryPrefix: true
    //  })
    // this.setState({room})
    // this.socket.emit('newRoomJoin', {room, name})

    // //New user join, logic decide on backend whether to display 
    // //the actual game or the wait screen or redirect back to the main page
    // this.socket.on('waiting', ()=> this.setState({waiting:true, currentPlayerScore:0, opponentPlayer:[]}))
    // this.socket.on('starting', ({gameState, players, turn})=> {
    //   this.setState({waiting:false})
    //   this.gameStart(gameState, players, turn)
    // })
    // this.socket.on('joinError', () => this.setState({joinError: true}))

    // //Listening to the assignment of piece store the piece along with the in state
    // //socket id in local socketID variable
    // this.socket.on('pieceAssignment', ({piece, id}) => {
    //   this.setState({piece: piece})
    //   this.socketID = id 
    // })

    // //Game play logic events
    // this.socket.on('update', ({gameState, turn}) => this.handleUpdate(gameState, turn))
    // this.socket.on('winner', ({gameState,id}) => this.handleWin(id, gameState))
    // this.socket.on('draw', ({gameState}) => this.handleDraw(gameState))

    // this.socket.on('restart', ({gameState, turn}) => this.handleRestart(gameState, turn))
  }

  //Setting the states to start a game when new user join
  gameStart(gameState, players, turn){
    const opponent = players.filter(([id, name]) => id!==this.socketID)[0][1]
    this.setState({opponentPlayer: [opponent, 0], end:false})
    this.setBoard(gameState)
    this.setTurn(turn)
    this.setMessage()
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

  //Setting the states each move when the game haven't ended (no wins or draw)
  handleUpdate(playerNo, updatedGame){
    var thisPlayer = this.state.piece === 'X'?1 :2;
    if(playerNo !== thisPlayer){
      this.setState({"turn": true})
    }
    this.setState({game:updatedGame})
  }

  //Setting the states when some one wins
  handleWin(playerNo) {
    this.setState({"turn": false})
    var thisPlayer = this.state.piece === 'X'?1 :2;
    if(playerNo !== thisPlayer){
      this.setState({"statusMessage": "Sorry, You lost"})
    } else {
      this.setState({"statusMessage": "Congrats!, You won"})
    }
    this.setState({end:true})
  }

  //Setting the states when there is a draw at the end
  handleDraw(gameState){
    this.setBoard(gameState)
    this.setState({end:true, statusMessage:'Draw'})
  }

  playAgainRequest = () => {
    this.socket.emit('playAgainRequest', this.state.room)
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
          <div className="board">
            {squareArray}
          </div>
          <ScoreBoard data={{you:['You', 10], opponent:['Opponent', 10]}}/>
          {/* <PlayAgain end={this.state.end} onClick={this.playAgainRequest}/> */}
        </div>
        </>
      )
    }
  }
}


export default Board


