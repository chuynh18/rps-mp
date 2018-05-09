"use strict";

// Initialize Firebase
var config = {
apiKey: "AIzaSyDLoA0v8nWpBGRyEpUuUN6XIppahYFF7DQ",
authDomain: "rpsmp-faf5f.firebaseapp.com",
databaseURL: "https://rpsmp-faf5f.firebaseio.com",
projectId: "rpsmp-faf5f",
storageBucket: "rpsmp-faf5f.appspot.com",
messagingSenderId: "274487637976"
};
firebase.initializeApp(config);

var database = firebase.database();

// -------------------------------------------------------------- (CRITICAL - BLOCK) --------------------------- //
// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

var data;
var player;
var userID;
var playerStatus;

var p1Ref = database.ref("/1");
var p1Play = database.ref("/1p");
var p1Wins = 0;
var p1Losses = 0;
var p1Draws = 0;
var p1Choice;
var p1HasPlayed = false;
var p1Obj;
var P1PlayObj;

var p2Ref = database.ref("/2");
var p2Play = database.ref("/2p");
var p2Wins = 0;
var p2Losses = 0;
var p2Draws = 0;
var p2Choice;
var p2HasPlayed = false;
var p2Obj;
var P2PlayObj;

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    var conID = connectionsRef.key;
    console.log(con.key);
    userID = con.key;


    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// assign player slot on connect
connectionsRef.once("value", function(snap) {
  if (snap.val()) {
    data = snap.val();
  };

  if (sessionStorage.getItem("player") !== null) {
    player = parseInt(sessionStorage.getItem("player"));
    playerStatus = sessionStorage.getItem("playerStatus");
    if (playerStatus === "player") {
      $("#player").text(playerStatus + " " + player);
    }
    else if (playerStatus === "spectator") {
      $("#player").text(playerStatus + " " + (player - 2));
    }
  }
  else {
    if (Object.keys(data).length < 3) {
      player = Object.keys(data).length;
      playerStatus = "player";
      sessionStorage.setItem("player", player);
      sessionStorage.setItem("playerStatus", playerStatus);
      $("#player").text(playerStatus + " " + player);
    }
    else if (Object.keys(data).length > 2) {
      player = Object.keys(data).length;
      playerStatus = "spectator";
      sessionStorage.setItem("player", player);
      sessionStorage.setItem("playerStatus", playerStatus);
      $("#player").text(playerStatus + " " + (player - 2));
    }
  };
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#watchers").text(snap.numChildren());
});

// listen for changes to p1Ref...
p1Ref.on("value", function(snapshot) {
  p1Obj = snapshot.val();
  if (player === 2) {
    p1Wins = p1Obj.win;
    p1Losses = p1Obj.loss;
    p1Draws = p1Obj.draw;
    // if (p1HasPlayed === true) {
    //   console.log("p1HasPlayed: " + p1HasPlayed);
    //   document.getElementById("player1Choice").textContent = "Player 1 has made their move!";
    // };
    // if (p1HasPlayed === true && p2HasPlayed === true) {

    //   checkWinner();
    //   resetGame();
    // };
  };
});

p1Play.on("value"), function(snapshot) {
  p1PlayObj = snapshot.val();
  if (player === 2) {
    // p1Choice = p1PlayObj.p1Play;
    p1HasPlayed = p1PlayObj.hasPlayed;
  };
  if (p1HasPlayed === true) {
    document.getElementById("player1Choice").textContent = "Player 1 has made their move!";
  };
  if (p1HasPlayed === true && p2HasPlayed === true) {
    resetGame();
  };
};

// ...and p2Ref
p2Ref.on("value", function(snapshot) {
  p2Obj = snapshot.val();
  if (player === 1) {
    p2Wins = p2Obj.win;
    p2Losses = p2Obj.loss;
    p2Draws = p2Obj.draw;
    // if (p2HasPlayed === true) {
    //   console.log("p2HasPlayed: " + p2HasPlayed);
    //   document.getElementById("player2Choice").textContent = "Player 2 has made their move!";
    // };
    // if (p1HasPlayed === true && p2HasPlayed === true) {

    //   checkWinner();
    //   resetGame();
    // };
  };
});

p2Play.on("value"), function(snapshot) {
  p2PlayObj = snapshot.val();
  if (player === 1) {
    p2Choice = p2PlayObj.p2Play;
    p2HasPlayed = p2PlayObj.hasPlayed;
    if (p2HasPlayed === true) {
      document.getElementById("player2Choice").textContent = "Player 2 has made their move!";
    };
    if (p1HasPlayed === true && p2HasPlayed === true) {
      checkWinner();
      resetGame();
    };
  };
};

// -------------------------------------------------------------- (CRITICAL - BLOCK) --------------------------- //

var setupGame = function() {
  if (player === 1) {
    var p1 = document.getElementsByClassName("player2");
    for (var i = 0; i < p1.length; i++) {
      p1[i].textContent = "";
    };
  }
  else if (player === 2) {
    var p2 = document.getElementsByClassName("player1");
    for (var i = 0; i < p2.length; i++) {
      p2[i].textContent = "";
    };
  }
  else if (player > 2) {
    var p1 = document.getElementsByClassName("player2");
    for (var i = 0; i < p1.length; i++) {
      p1[i].textContent = "";
    };
    var p2 = document.getElementsByClassName("player1");
    for (var i = 0; i < p2.length; i++) {
      p2[i].textContent = "";
    };
  }
  else {
    setTimeout(function() {
      setupGame();
    }, 1000);
  }
};

// updates page with wins and losses based on client-side variables.
// need to write function to keep client-side in sync with server-side
var updateWinLoss = function() {
  document.getElementById("player1Wins").textContent = p1Wins;
  document.getElementById("player1Losses").textContent = p1Losses;
  document.getElementById("player1Draws").textContent = p1Draws;
  document.getElementById("player2Wins").textContent = p2Wins;
  document.getElementById("player2Losses").textContent = p2Losses;
  document.getElementById("player2Draws").textContent = p2Draws;

};

// build out logic to send play to server here
// "play" is the RPS hand played
var p1Send = function() {
  p1Ref.set({
    win: p1Wins,
    loss: p1Losses,
    draw: p1Draws,
  });
  console.log(p1Draws);
  console.log(p2Draws);
};

var p1SendPlay = function(play) {
  p1Play.set({
    hasPlayed: p1HasPlayed,
    play: play
  });
};

var p2Send = function() {
  p2Ref.set({
    win: p2Wins,
    loss: p2Losses,
    draw: p2Draws,
  });
  console.log(p1Draws);
  console.log(p2Draws);
};

var p2SendPlay = function(play) {
  p2Play.set({
    hasPlayed: p2HasPlayed,
    play: play
  });
};

// player 1 can make a selection
$(document).on("click", ".player1", function() {
  if (player === 1) {
    console.log("click p1");
    p1Choice = $(this).attr("id");
    p1Choice = p1Choice.substr(0, p1Choice.length - 1)
    if (p1Choice === "rock") {
      document.getElementById("rock1").textContent = "";
      document.getElementById("paper1").textContent = "";
      document.getElementById("scissors1").textContent = "";
      document.getElementById("player1Choice").textContent = "Rock";
      p1HasPlayed = true;
    }
    else if (p1Choice === "paper") {
      document.getElementById("rock1").textContent = "";
      document.getElementById("paper1").textContent = "";
      document.getElementById("scissors1").textContent = "";
      document.getElementById("player1Choice").textContent = "Paper";
      p1HasPlayed = true;
    }
    else if (p1Choice === "scissors") {
      document.getElementById("rock1").textContent = "";
      document.getElementById("paper1").textContent = "";
      document.getElementById("scissors1").textContent = "";
      document.getElementById("player1Choice").textContent = "Scissors";
      p1HasPlayed = true;
    }
    p1SendPlay(p1Choice); // call send function to send play to firebase
  }
  else {console.log("you are not player 1")};
});


// player 2 can do what player 1 can do
$(document).on("click", ".player2", function() {
  if (player === 2) {
    console.log("click p2");
    p2Choice = $(this).attr("id");
    p2Choice = p2Choice.substr(0, p2Choice.length - 1)
    if (p2Choice === "rock") {
      document.getElementById("rock2").textContent = "";
      document.getElementById("paper2").textContent = "";
      document.getElementById("scissors2").textContent = "";
      document.getElementById("player2Choice").textContent = "Rock";
      p2HasPlayed = true;
    }
    else if (p2Choice === "paper") {
      document.getElementById("rock2").textContent = "";
      document.getElementById("paper2").textContent = "";
      document.getElementById("scissors2").textContent = "";
      document.getElementById("player2Choice").textContent = "Paper";
      p2HasPlayed = true;
    }
    else if (p2Choice === "scissors") {
      document.getElementById("rock2").textContent = "";
      document.getElementById("paper2").textContent = "";
      document.getElementById("scissors2").textContent = "";
      document.getElementById("player2Choice").textContent = "Scissors";
      p2HasPlayed = true;
    }
    p2SendPlay(p2Choice); // call send function to send play to firebase
  }
  else {console.log("you are not player 2")};
});

// write RPS logic here
function checkWinner() {
  if (player === 1) {
    if (p1Choice === p2Choice) {
      console.log("draw");
      p1Draws++;
      p2Draws++;
      // console.log(p1Draws);
      // console.log(p2Draws);
    }
    else if (p1Choice === "rock" && p2Choice === "scissors") {
      console.log("p1 win");
      p1Wins++;
      p2Losses++;
    }
    else if (p1Choice === "rock" && p2Choice === "paper") {
      console.log("p2 win");
      p1Losses++;
      p2Wins++;
    }
    else if (p1Choice === "paper" && p2Choice === "scissors") {
      console.log("p2 win");
      p1Losses++;
      p2Wins++;
    }
    else if (p1Choice === "paper" && p2Choice === "rock") {
      console.log("p1 win");
      p1Wins++;
      p2Losses++;
    }
    else if (p1Choice === "scissors" && p2Choice === "rock") {
      console.log("p2 win");
      p1Losses++;
      p2Wins++;
    }
    else if (p1Choice === "scissors" && p2Choice === "paper") {
      console.log("p1 win");
      p1Wins++;
      p2Losses++;
    }
    else {
      console.log("something wrong");
    }
    p1HasPlayed = false;
    p2HasPlayed = false;
    setTimeout(function() {
      // console.log(p1Draws);
      // console.log(p2Draws);
      p1Send("checkWinner");
      p2Send("checkWinner");
      // console.log(p1Draws);
      // console.log(p2Draws);
    }, 1000);
  };
};

// write reset game functionality here
function resetGame() {
  setTimeout(function() {
    p1Choice = "";
    p2Choice = "";
    document.getElementById("player1Choice").textContent = p1Choice;
    document.getElementById("player2Choice").textContent = p2Choice;
    if (player === 1) {
      document.getElementById("rock1").textContent = "Rock";
      document.getElementById("paper1").textContent = "Paper";
      document.getElementById("scissors1").textContent = "Scissors";
    };
    if (player === 2) {
      document.getElementById("rock2").textContent = "Rock";
      document.getElementById("paper2").textContent = "Paper";
      document.getElementById("scissors2").textContent = "Scissors";
    };
    setupGame();
  }, 2000);};




// --------------------------------------- function calls ---------------------------------------

setupGame();
updateWinLoss();