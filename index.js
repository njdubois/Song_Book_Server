var http = require('http');
var tracks = require("./trackDetailsJson")
var url = require('url');
const qs = require('querystring');
const { parse } = require('querystring');
var moment = require('moment');
var _ = require('underscore');

const fs = require('fs');

let setLists;
let setListNames = [];

let songList = [];

function loadSetListFile() {
    setLists = JSON.parse(fs.readFileSync('setlists.json', 'utf8'));

    for( let aSetListName in setLists ) {
    	let aSetList = setLists[aSetListName];
    	setListNames.push(aSetListName);
	}
}
loadSetListFile();

// ***************************************************************************************************************

// ** GET Route Functions :

let homeIndex = (response, body) => {
    let responseData = JSON.stringify(body, null, 3);
    sendResponse(response, 200, responseData);
    return true;
};

let getSetList = (response, body) => {
    let setListName = body.body.setListName;

    let responseData = JSON.stringify(setLists[setListName], null, 3);

    sendResponse(response, 200, responseData);

    return true;
};

let getSetListNames = (response, body) => {
    let responseData = JSON.stringify(Object.keys(setLists), null, 3);
    sendResponse(response, 200, responseData);

    return true;
};

let getWholeList = (response, body) => {
    let responseData = JSON.stringify(setLists, null, 3);
    sendResponse(response, 200, responseData);

    return true;
};

// ** POST Route Functions :

let createList = (response, data) => {

    console.log("body in createList", data);

    let responseData = JSON.stringify(data.body, null, 3);
    sendResponse(response, 200, responseData);

    return true;
};

let saveList = (response, body) => {
    let responseData = JSON.stringify(body, null, 3);
    sendResponse(response, 200, responseData);

    return true;
};

let saveSong = (response, data) => {

    let artistNameSlug = data.body.artistName.toLowerCase().replace(/ /g, '_');

    let songJson = {
     //   "artistName": data.body.artistName,
        "songNameSlug": data.body.songName.toLowerCase().replace(/ /g, '_'),
        "songName": data.body.songName,
        "fromAlbum": data.body.fromAlbum,
        "dateAdded": moment().format(),
        "notes": data.body.notes,
        "pages": JSON.parse(data.body.pageList)
    };

    // Does the artist exist?

    //songList
    let artistData = _.where(songList, {"artistNameSlug": artistNameSlug});

    let newArtistJson = {};

    if ( artistData.length > 0 ) {
        // artist exists
        newArtistJson = {"artist exists!": true};
    } else {
        // artist does not exist.

        newArtistJson = {
            "artistName": data.body.artistName,
            "artistNameSlug": artistNameSlug,
            "dateAdded":moment().format(),
            "songList": [
                songJson
            ]
        };
    }

    let responseData = JSON.stringify(newArtistJson);
    sendResponse(response, 200, responseData);

    return true;
};


// ***************************************************************************************************************

// Route Definitions :

const postRoutes = {
    "/saveList": saveList,
    "/createList": createList,
    "/song/save": saveSong
};

const getRoutes = {
    "/": homeIndex,
    "/getSetList": getSetList,
    "/getSetListNames": getSetListNames,
    "/getWholeList": getWholeList,
};


// ***************************************************************************************************************

// Web Server :

http.createServer(function(request, response){


    let incomingUrl = request.url.split("?")[0];

    var callback = () => {return true;};

    let body = [];

    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {

        body = Buffer.concat(body).toString();


        var queryStr = body,
            queryArr = queryStr.split('&'),
            queryParams = {};

        for (var q = 0, qArrLength = queryArr.length; q < qArrLength; q++) {
            var qArr = queryArr[q].split('=');
            queryParams[qArr[0]] = decodeURIComponent(qArr[1]);
        }

        callback(response, {"body": queryParams});

    });

    if (request.method == 'POST') {

        if (postRoutes.hasOwnProperty(incomingUrl)) {
            callback = postRoutes[incomingUrl];
        }
    }
    else if (request.method == 'GET') {
        if (getRoutes.hasOwnProperty(incomingUrl)) {
            let query = url.parse(request.url,true).query;

            getRoutes[incomingUrl](response, {"body": query});
        }
    }
    else {
        response.writeHead(404, {'Content-type': 'text/plan'});
        response.write('route not found. ' + incomingUrl + " using method " + request.method);
        response.end();
    }

}).listen(7000);

sendResponse = (response, responseCode, responseJson) => {
    response.writeHead(responseCode, {"Access-Control-Allow-Origin": "*",'Content-type':'application/json'});
    response.write( responseJson );
    response.end( );

    return true;
};
