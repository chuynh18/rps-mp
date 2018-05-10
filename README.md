Multiplayer Rocks-Papers-Scissors readme
========================================

Hello and welcome to my hastily-written README.md for my hastily-written RPS-MP optional homework assignment.  This repository contains an online multiplayer rocks-papers-scissors game.

There are a lot of known issues and corner cases, and I'll detail them below.  Most of them I knew about as I was writing the JavaScript, but I chose to forge ahead given my limited time and knowledge.  At the end of the day, this assignment does work.  It's not the most robust, but it also isn't the least robust.

I knew going in that I wanted to make one improvement upon the version of RPS that was demoed to us.  In the demo version, one player would have to make a play first, followed by the other player.  I wanted a version where it did not matter who went first.  I more or less succeeded.

Known issues and caveats
------------------------

I assign player role by checking how many keys there are in the connected players database.  I do this check immediately after the page loads.  If the length of this database is one, then that session is assigned the role of player 1.  If it's two, player 2.  If it's longer, then I assign spectator roles.  However, SPECTATOR FUNCTIONALITY HAS NOT BEEN IMPLEMENTED.  It probably won't be, either, as my priority is now the first group project.  However, I believe I know how to implement it.  I don't believe the logic to be complicated; it'll just take some time as I iterate and fix areas that I miss.

Upon deciding to do player assignment in the manner described above, I immediately realized an edge case before writing a single line of code.  If player 1 and player 2 join, then player 1 refreshes the page, there will be two player 2s.  I partially solved this by using session storage.  My logic first checks session storage to see if the player has been assigned a role.  If so, then the browser will assume that role.  Otherwise, it'll proceed with the logic described in the paragraph above this one.  There is an edge case with this behavior:  if Player 1 leaves the page, nobody else can become player 1 until every single player closes out of the page first.  I don't really have ideas for fixes yet, but it is something I'll think about in the back of my mind from time to time.

I think that there's also some fragility with this method.  I'm piggybacking on the code that shows the active number of people who have loaded the page.  This logic pushes "true" upon page load and removes that "true" when the page is closed.  However, I do not believe this to be robust in cases where folks have bad connections, nor does it guard against cases where the browser tab or browser itself crashes (and is therefore unable to remove the corresponding "true" from Firebase).

Chat was implemented by just using .set() like so:
<pre><code>var sendChat = function(msg) {
  chatDB.set({
    lastMessage: msg
  });
};</pre></code>

Receiving chat messages is accomplished with <pre><code>on("value")</pre></code>.

There is minor non-ideal behavior with this method:  the last line of chat persists and will show up to new users who've just loaded the page, and the same line of chat cannot be repeated by the same player (Firebase won't register this as a change, meaning no updates are broadcasted to the browser, and therefore no new line of chat is shown.)

Oh, and the way we're storing API keys in plaintext in the js file?  And leaving the Firebase db set to public?  Do I even need to call those out as suboptimal?

A little bit about architectural decisions
------------------------------------------

Obviously, we haven't yet covered node.js, so I'm unable to write an independent server for this (unless I did a lot of independent research).  The solution I eventually went with is making Player 1 the authoritative and sole source of truth for determining the winner of each RPS round, along with also being the source of truth for win/loss records.  Player 2 is only able to send two things to Firebase:  chat messages and one play per round.  Player 1 is able to send one play per round and chat messages also, obviously.  However, Player 1's browser also retrieves Player 2's play, then computes the winner of the round, updates the score accordingly, then sends that all to Firebase.  Player 2 (and spectators) then are given the updated records by Firebase and update what's displayed on their page based on that.

Ultimately, no matter what architecture I chose, the game would still end up trusting the client for everything.  I suppose I could have made it so that it takes three instances of the page loaded up in order to play; one of those tabs would have acted as a server (in the sense that whoever loaded that tab would not be participating in the game).

I also want to dig in a little bit about how I accomplished making my version of RPS not care about whether Player 1 or Player 2 made the first move each round.

Upon page load, and immediately after each round, I have Player 1 set the value of both players' hands to "neutral" (as in the string "neutral").  I have logic that checks to see when the value of Player 1 AND Player 2's hands not being neutral.  When those conditions are met, Player 1's browser runs the checkWinner() function and pushes the result to Firebase.  Initially, I had this logic only fire based on Firebase's on("value") functionality.  However, this meant that checkWinner() would not run in the case where Player 1 moved second.  I solved this by also adding checkWinner() inside the described conditional in Player 1's on("click"), in the same area where Player 1 sends their hand to Firebase.  This accounted for cases where Player 1 chose to make a play after Player 2.

Closing
-------

So, at the end of the day, we have a fairly messy effort with a lot of known issues, fragility, and edge cases that are fairly large (so, maybe not "edge cases"... just "bugs").  Still, I'm happy I attempted the assignment and succeeded to some degree.  I learned a lot and feel a little more comfortable with Firebase, though I still don't like its syntax (it feels pretty unnecessarily verbose.  Also, how can you write so much documentation and get so little bang for the buck?  There's shorter and more information-dense documentation out there!)

Thanks for reading this far.  I never thought I'd be able to write something like this, and so quickly, too.  I've only been programming in any language since we started JavaScript some three weeks ago.  The road ahead is still long and uncertain, but this was a real confidence-builder.