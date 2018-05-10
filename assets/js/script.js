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
var playerStatus;

var p1Ref = database.ref("/1");
var p1RefPlays = database.ref("/1p");
var p1Wins = 0;
var p1Losses = 0;
var p1Draws = 0;
var p1Choice = "neutral";
var p1Obj;
var p1PlayObj;

var p2Ref = database.ref("/2");
var p2RefPlays = database.ref("/2p");
var p2Wins = 0;
var p2Losses = 0;
var p2Draws = 0;
var p2Choice = "neutral";
var p2Obj;
var p2PlayObj;

// chat code below
var chatDB = database.ref("/chat");

// listen for chat messages
chatDB.on("value", function(snapshot) {
  if (snapshot.val()) {
    var chatLine = $("<div>");
    chatLine.text(snapshot.val().lastMessage);
    $("#chatBox").append(chatLine);
    var chatBox = document.getElementById("chatBox");
    chatBox.scrollTop = chatBox.scrollHeight;
  };
})

// this function sends chat message to firebase
var sendChat = function(msg) {
  chatDB.set({
    lastMessage: msg
  });
};

// this grabs whatever was typed into the chat message box and sends it to Firebase
$(document).on("click", "#chatSubmit", function(event) {
        
  event.preventDefault();

  var chatMsg = $("#chatMsg").val().trim();
  var msgToSend = playerStatus + " " + player + ": " + chatMsg;
  sendChat(msgToSend);
  $("#chatMsg").val("");

});

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    var conID = connectionsRef.key;


    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  };
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
    };
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
    };
  };

  if (player === 1) {
    document.getElementById("player1").classList.add("active");
  }
  else if (player === 2) {
    document.getElementById("player2").classList.add("active");
  };
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#watchers").text(snap.numChildren());
});



p1Ref.on("value", function(snapshot) {
  p1Obj = snapshot.val();
  // p1 is authoritative and does not need to take action based on changes to firebase
  // hence there is no logic for player 1 here

  // player 2 is slaved to player 1, so player2 needs to get ALL stats from firebase
  if (player === 2) {
    p1Wins = p1Obj.win;
    p1Losses = p1Obj.loss;
    p1Draws = p1Obj.draw;
  };
  updateWinLossDisplay();
  resetGameDisplay();
  p2Choice = "neutral";

});

p2Ref.on("value", function(snapshot) {
  p2Obj = snapshot.val();
  // p1 is authoritative and does not need to take action based on changes to firebase
  // hence there is no logic for player 1 here

  // player 2 is slaved to player 1, so player2 needs to get ALL stats from firebase
  if (player === 2) {
    p2Wins = p2Obj.win;
    p2Losses = p2Obj.loss;
    p2Draws = p2Obj.draw;
  };
  updateWinLossDisplay();
  resetGameDisplay();
  p2Choice = "neutral";

});

// same as above, but for p1's play
p1RefPlays.on("value", function(snapshot) {
  p1PlayObj = snapshot.val();

  // player 2 is slaved to player 1, so player2 needs to update from firebase
  if (player === 2) {
    p1Choice = p1PlayObj.play;
    if (p1Choice != "neutral") {
      document.getElementById("player1Choice").textContent = "P1 has made a move!";
    };
  };
});

// player 1 must listen for player2 decisions (or else how could p1 run the logic)
p2RefPlays.on("value", function(snapshot) {
  p2PlayObj = snapshot.val();
  // p1 is authoritative and does not need to take action based on changes to firebase
  // hence there is no logic for player 1 here
  if (player === 1) {
    p2Choice = p2PlayObj.play;

    // player 1 also needs to know when player 2 has moved in order to trigger the logic
    if (p2Choice != "neutral") {
      document.getElementById("player2Choice").textContent = "P2 has made a move!";
    };

    // logic to process the game
    if (p2Choice != "neutral" && p1Choice != "neutral") {
      checkWinner();
      resetGameDisplay();

    };
  };

});


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
// this does not touch firebase at all.  this is purely display
var updateWinLossDisplay = function() {
  document.getElementById("player1Wins").textContent = p1Wins;
  document.getElementById("player1Losses").textContent = p1Losses;
  document.getElementById("player1Draws").textContent = p1Draws;
  document.getElementById("player2Wins").textContent = p2Wins;
  document.getElementById("player2Losses").textContent = p2Losses;
  document.getElementById("player2Draws").textContent = p2Draws;

};

// sending to firebase functions
var p1Send = function() {
  p1Ref.set({
    win: p1Wins,
    loss: p1Losses,
    draw: p1Draws,
  });
};

var p1SendPlay = function(hand) {
  p1RefPlays.set({
    play: hand
  });
};

var p2Send = function() {
  p2Ref.set({
    win: p2Wins,
    loss: p2Losses,
    draw: p2Draws,
  });
};

var p2SendPlay = function(hand) {
  p2RefPlays.set({
    play: hand
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

    }
    else if (p1Choice === "paper") {
      document.getElementById("rock1").textContent = "";
      document.getElementById("paper1").textContent = "";
      document.getElementById("scissors1").textContent = "";
      document.getElementById("player1Choice").textContent = "Paper";

    }
    else if (p1Choice === "scissors") {
      document.getElementById("rock1").textContent = "";
      document.getElementById("paper1").textContent = "";
      document.getElementById("scissors1").textContent = "";
      document.getElementById("player1Choice").textContent = "Scissors";

    }
    p1SendPlay(p1Choice);
    if (p2Choice != "neutral" && p1Choice != "neutral") {
      checkWinner();
      resetGameDisplay();

    };
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

    }
    else if (p2Choice === "paper") {
      document.getElementById("rock2").textContent = "";
      document.getElementById("paper2").textContent = "";
      document.getElementById("scissors2").textContent = "";
      document.getElementById("player2Choice").textContent = "Paper";

    }
    else if (p2Choice === "scissors") {
      document.getElementById("rock2").textContent = "";
      document.getElementById("paper2").textContent = "";
      document.getElementById("scissors2").textContent = "";
      document.getElementById("player2Choice").textContent = "Scissors";

    }
    p2SendPlay(p2Choice);
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
      console.log("nothing to see here");
    }
    p1Choice = "neutral";
    p2Choice = "neutral";

    setTimeout(function() {
      p1Send();
      p2Send();
      p1SendPlay("neutral");
      p2SendPlay("neutral");
      updateWinLossDisplay();
    }, 600);
  };
};

// reset the game display only - nothing sent to firebase
function resetGameDisplay() {
  setTimeout(function() {
    document.getElementById("player1Choice").textContent = "";
    document.getElementById("player2Choice").textContent = "";
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
  }, 250);};

  function initializeFirebase() {
    p1Send();
    p2Send();
    p1SendPlay("neutral");
    p2SendPlay("neutral");
  };



// --------------------------------------- function calls ---------------------------------------

setupGame();
updateWinLossDisplay();
initializeFirebase();