/************** Import Keys *****************/
var keyList = require('./keys.js');

for (var key in keyList) {

	// Keys for Twitter
	if (key === "consumer_key") {
		var consumer_key = keyList[key];
	}
	if (key === "consumer_secret") {
		var consumer_secret = keyList[key];
	}
	if (key === "access_token_key") {
		var access_token_key = keyList[key];
	}
	if (key === "access_token_secret") {
		var access_token_secret = keyList[key];
	}

	// Keys for Spotify
	if (key === "client_id") {
		var client_id = keyList[key];
	}
	if (key === "client_secret") {
		var client_secret = keyList[key];
	}

}
/************** End of Import Keys ***********/

/************** Include NPM packages **********/
var request = require("request"); // npm request to use in movie-this
var fs = require("fs"); // npm fs to read ramdom.txt and write(log) into log.txt
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
/********* End of Include NPM packages ********/

var nodeArgs = process.argv; // user input 

if (process.argv.length < 3) {
	// Displaying how to use when command is not input.
	console.log("");
	console.log("Please input command.");
	console.log("");
	console.log(" How to use: ");
	console.log("  node liri.js my-tweets");
	console.log("  node liri.js spotify-this-song 'song name here'");
	console.log("  node liri.js movie-this 'movie name here'");
	console.log("  node liri.js do-what-it-says");
	console.log("");

}
else {

	var command = nodeArgs[2].toLowerCase(); // command
	var searchWord = ""; // argument for spotify and movie search
	var printData = ""; // output and logging data

	for (var i = 3; i < nodeArgs.length; i++) {
		searchWord += " " + nodeArgs[i].toLowerCase(); // Song name or Movie name
	}

	searchWord = searchWord.trim();// This is neccesary because there is a space in front of searchWord.

	// getting the current time
	var date = new Date();
	var options = {
	    weekday: "long", year: "numeric", month: "short",
	    day: "numeric", hour: "2-digit", minute: "2-digit"
	};

	// logging input command and time
	printData += "****************************************\n"　// partition between logs
	printData += date.toLocaleTimeString("en-us", options) + ": " + command + " " + searchWord + "\n"; // logging time only on log.txt

	// logging input command to log.txt
	fs.appendFile("log.txt", printData, function(error) {
		if (error) {
			return console.log(error);
		}
	});

	printData = ""; // Once input command is logged, clear printData to store output data.

	mainTask(command, searchWord); // Execute main task here
}

// In order to share this procedure with do-what-it-says, define this as a function.
function mainTask(command, searchWord) {
	switch(command) {
	    case "my-tweets":
	    	twi();
	        break;
	    case "spotify-this-song":
	    	spo(searchWord); // take in argument
	        break;
	    case "movie-this":
	    	mov(searchWord); // take in argument
	        break;
	    case "do-what-it-says":
	    	doWhat();
	        break;
	    default:
	    	def();
	        break;
	}
}

/*** default ***/
function def(){

	printData = "\nI'm not sure I understand.\n";

	// print on display
	console.log(printData);

	// logging into log.txt
	fs.appendFile("log.txt", printData, function(error) {
		if (error) {
			return console.log(error);
		}
	});

}

/*** my-tweets ***/
function twi() {

	var client = new Twitter({
	  consumer_key: consumer_key,
	  consumer_secret: consumer_secret,
	  access_token_key: access_token_key,
	  access_token_secret: access_token_secret
	});

	var userName = "Hugh0513"

	var params = {screen_name: userName}; // Specifying User name here

	client.get('statuses/user_timeline', params, function(error, tweets, response) {

		printData += "\nHere's " + userName + "'s tweets:\n";
		printData += "----------------------------\n";

		if (!error) {
    		for (var i=0; i < tweets.length && i < 20; i++){
    			printData += tweets[i].text + "\n";
				printData += "----------------------------\n";
    		}
		}

		console.log(printData); // print on display

		// logging the data to log.txt. It isn't logged unless this is in client.get.
		fs.appendFile("log.txt", printData, function(error) {
			if (error) {
				return console.log(error);
			}
		});

	}); // End of client get

} // End of function twi

/*** spotify-this-song ***/
function spo(songName) {

	if (songName === "") {
		songName = "The Sign";
	}

	var spotify = new Spotify({
		  id: client_id,
		  secret: client_secret
	});

	spotify.search({ type: 'track', query: songName }, function(error, data) {
		if (error) {
			return console.log('Error occurred: ' + error);
		}

		var cnt = 0; // The number of results
	 
		printData += "\nHere's what I found on Spotify for '" + songName + "':\n";
		printData += "----------------------------\n";

		for (var i=0; i < data.tracks.items.length; i++){

			// printing only song name matchs because sometime another song hits on spofify.
			if (data.tracks.items[i].name.toLowerCase() === songName.toLowerCase()) {

				// logging
    			printData += "Artist: " + data.tracks.items[i].artists[0].name + "\n";
				printData += "Song name: " + data.tracks.items[i].name + "\n";
				printData += "Preview: " + data.tracks.items[i].preview_url + "\n";
				printData += "Album: " + data.tracks.items[i].album.name + "\n";
				printData += "----------------------------" + "\n";

				cnt++;
			}
		}

		//console.log("total: " + cnt);
		printData += "total: " + cnt + "\n";
		console.log(printData);

		// logging th data to log.txt. It isn't logged unless this is in spotify search.
		fs.appendFile("log.txt", printData, function(error) {
			if (error) {
				return console.log(error);
			}
		});

	}); // End of spotify search

} // End of function spo

/*** movie-this ***/
function mov(movieName) {

	if (movieName === "") {
		movieName = "Mr. Nobody";
	}

	var apikey = "40e9cece"
	var reqURL = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + apikey;

	request(reqURL, function(error, response, body) {

		// If the request is successful (i.e. if the response status code is 200)
		if (!error && response.statusCode === 200) {

		  	//console.log(JSON.stringify(response, null, 2));

			printData += "\nHere's what I found on OMDB for '" + movieName + "':\n";
			printData += "----------------------------\n";

			printData += "Title: " + JSON.parse(body).Title + "\n";
			printData += "Year: " + JSON.parse(body).Year + "\n";
			printData += "Rating: " + JSON.parse(body).imdbRating + "\n";
			printData += "Country: " + JSON.parse(body).Country + "\n";
			printData += "Language: " + JSON.parse(body).Language + "\n";
			printData += "Plot: " + JSON.parse(body).Plot + "\n";
			printData += "Actors: " + JSON.parse(body).Actors + "\n";
			printData += "----------------------------\n";
			
			console.log(printData); // print on display

			// logging th data to log.txt. It isn't logged unless this is in request.
			fs.appendFile("log.txt", printData, function(error) {
				if (error) {
					return console.log(error);
				}
			});

		}
	}); // End of request

} // End of function mov

/*** do-what-it-says ***/
function doWhat() {

	fs.readFile("random.txt", "utf8", function(error, data) {

		if (error) {
			return console.log(error);
		}

		// logging data
		printData = "ramdom.txt: " + data + "\n";
		fs.appendFile("log.txt", printData, function(error) {
			if (error) {
				return console.log(error);
			}
		});
		printData = "";
	
		var dataArr = data.split(/\s*\,\s*/);

		var command = dataArr[0].toLowerCase();
		var searchWord = dataArr[1].replace(/\"/g,"");

		if (command === "do-what-it-says") {
			printData = "\nI am sorry. I cannot accept your request.\n";

			console.log(printData);
			
			// logging 
			fs.appendFile("log.txt", printData, function(error) {
				if (error) {
					return console.log(error);
				}
			});
		}
		else {
			mainTask(command, searchWord);
		}

	});
	
} // End of function doWhat 
