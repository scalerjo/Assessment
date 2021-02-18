class Point {
    /**
     * 
     * @param {Integer} x_ 
     * @param {Integer} y_ 
     */
    constructor(x_, y_){
        this.x = x_;
        this.y = y_;
    }

    toJSON(){
        return {
            "x": this.x,
            "y": this.y
        }
    }

    isEqual(p){
        return p.x == this.x && p.y == this.y;
    }
}

class Line {
    /**
     * 
     * @param {Point} point1 
     * @param {Point} point2 
     */
    constructor(point1, point2){
        this.start = point1;
        this.end = point2;
    }

    toJSON(){
        return {
            "start": this.start.toJSON(),
            "end": this.end.toJSON()
        }
    }
}

class GameController {

    //Constructor
    constructor(){
        this.PlayerTurn = 1;

        this.head = null;
        this.tail = null;

        // Variable to store the First click of a move
        this.FirstClick = null;

        //Stores which nodes have already been drawn on
        this.board = new Array(4);
        for (var i = 0; i < this.board.length; i++){
            this.board[i] = new Array(4);
            for (var j = 0; j < this.board.length; j++){
                this.board[i][j] = 0;
            }
        }
    }

    // Player 1 always goes first
    InitMessage(){
        return {
            "msg": "INITIALIZE",
            "body": {
                "newLine": null,
                "heading": "Player 1",
                "message": "Awaiting Player 1's Move"
            }
        }
    }

    /**
     * Purpose: Processes a click event
     * @param {*} body 
     */
    nodeClicked(body){
        // Prevents the server from crashing on runtime errors
        // Allows the client to just simply refresh to get a new game on an error
        try {
            const x = body.x;
            const y = body.y;
            const NewPoint = new Point(x, y);

            //If the game has just been initialized
            if (this.head == null && this.tail == null){
                if (this.FirstClick == null){
                    this.FirstClick = NewPoint;
                    const msg = this.ValidStartMessage();
                    return msg;
                }
                else {
                    this.head = this.FirstClick;
                    this.tail = NewPoint;
                    this.MarkBoard(this.head);
                    this.MarkBoard(this.tail);
                    const NewLine = new Line(this.FirstClick, NewPoint);
                    this.FlipTurn();
                    const msg = this.ValidEndMessage(NewLine);
                    this.FirstClick = null;
                    return msg;
                }
            }
            //At least 1 move has been made.
            //ASSUMPTION: this.head != null && this.tail != null
            else {
                if (this.FirstClick == null){

                    //Test if the first click is either at the head or the tail
                    if (this.head.isEqual(NewPoint) || this.tail.isEqual(NewPoint)){
                        this.FirstClick = NewPoint;
                        const msg = this.ValidStartMessage();
                        return msg;
                    }
                    else {
                        const msg = this.InvalidStartMessage();
                        return msg;
                    }
                }
                else {
                    //Test if the second move is 1 position Horizontally or 1 position Vertically. 
                    if (this.board[x][y] == 0 && ((Math.abs(this.FirstClick.x - x)==1 && this.FirstClick.y == y) || (Math.abs(this.FirstClick.y - y) == 1 && this.FirstClick.x == x))){
                        const NewLine = new Line(this.FirstClick, NewPoint);

                        //Shift the head/tail to the second click position
                        if (this.head.isEqual(this.FirstClick)){
                            this.head = NewPoint;
                        } else {
                            this.tail = NewPoint;
                        }

                        //Mark the board at the second click position
                        this.MarkBoard(NewPoint);
                        this.FlipTurn();
                        const msg = this.ValidEndMessage(NewLine);
                        this.FirstClick = null;
                        return msg;
                    } else {
                        this.FirstClick = null;
                        const msg = this.InvalidEndMessage();
                        return msg;
                    }
                }
            }
        }
        catch (err){
            console.log(err);
            return("Error processing Node Clicked");
        }

    }

    //Change the player's turn
    FlipTurn(){
        if (this.PlayerTurn == 1){
            this.PlayerTurn = 2;
        } else {
            this.PlayerTurn = 1;
        }
    }

    //Purpose: Determines if the game is over
    isOver(){
        if (this.head.x-1 >= 0 && this.board[this.head.x-1][this.head.y] == 0){
            return false;
        }
        else if (this.head.x+1 < this.board.length && this.board[this.head.x+1][this.head.y] == 0){
            return false;
        }
        else if (this.head.y-1 >= 0 && this.board[this.head.x][this.head.y-1] == 0){
            return false;
        }
        else if (this.head.y+1 < this.board[0].length && this.board[this.head.x][this.head.y+1] == 0){
            return false;
        }
        else if (this.tail.x-1 >= 0 && this.board[this.tail.x-1][this.tail.y] == 0){
            return false;
        }
        else if (this.tail.x+1 < this.board.length && this.board[this.tail.x+1][this.tail.y] == 0){
            return false;
        }
        else if (this.tail.y-1 >= 0 && this.board[this.tail.x][this.tail.y-1] == 0){
            return false;
        }
        else if (this.tail.y+1 < this.board[0].length && this.board[this.tail.x][this.tail.y+1] == 0){
            return false;
        }
        else {
            return true;
        }
    }

    InvalidStartMessage(){
        return {
            "msg": "INVALID_START_NODE",
            "body": {
                "newLine": null,
                "heading": "Player " + this.PlayerTurn.toString(),
                "message": "Not a valid starting position."
            }
        }
    }

    InvalidEndMessage(){
        return {
            "msg": "INVALID_END_NODE",
            "body": {
                "newLine": null,
                "heading": "Player " + this.PlayerTurn.toString(),
                "message": "Invalid move!"
            }
        }
    }

    ValidStartMessage(){
        return {
            "msg": "VALID_START_NODE",
            "body": {
                "newLine": null,
                "heading": "Player " + this.PlayerTurn.toString(),
                "message": "Select a second node to complete the line."
            }
        }
    }

    ValidEndMessage(newLine){
        var msg;
        var heading;
        var message;

        if (this.isOver()){
            msg = "GAME_OVER";
            heading = "Game Over";
            message = "Player " + this.PlayerTurn.toString() + " Wins!";
        } else {
            msg = "VALID_END_NODE";
            heading = "Player " + this.PlayerTurn.toString();
            message = null;
        }
        return {
            "msg": msg,
            "body": {
                "newLine": newLine.toJSON(),
                "heading": heading,
                "message": message
            }
        }
    }

    MarkBoard(point) {
        this.board[point.x][point.y] = 1;
    }
}
module.exports = GameController;