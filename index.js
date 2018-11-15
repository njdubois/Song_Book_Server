var http = require('http');
var tracks = require("./trackDetailsJson")
var url = require('url');
const qs = require('querystring');
const { parse } = require('querystring');

const fs = require('fs');

let setLists;
let setListNames = [];

function loadSetListFile() {
    setLists = JSON.parse(fs.readFileSync('setlists.json', 'utf8'));

    for( let aSetListName in setLists ) {
    	let aSetList = setLists[aSetListName];

    	setListNames.push(aSetListName);
    	//console.log("\n\n\n\n");
    	//console.log(aSetListName);
	}

}
loadSetListFile();

// ***************************************************************************************************************

// Route Functions :

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

let saveList = (response, body) => {
    let responseData = JSON.stringify(body, null, 3);
    sendResponse(response, 200, responseData);

    return true;
};

let getWholeList = (response, body) => {
    let responseData = JSON.stringify(setLists, null, 3);
    sendResponse(response, 200, responseData);

    return true;
};

// ***************************************************************************************************************

// Route Definitions :

const postRoutes = {
    "/saveList": saveList,
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
    let body = null;

    let incomingUrl = request.url.split("?")[0];


    if (request.method == 'POST') {
        if (postRoutes.hasOwnProperty(incomingUrl)) {

            request.on('data', chunk => {
                body += chunk.toString();
            });

            postRoutes[incomingUrl](response, {"body": body, "routes": {"postRoutes": postRoutes, "getRoutes": getRoutes }});
        }
    }
    else if (request.method == 'GET') {
        if (getRoutes.hasOwnProperty(incomingUrl)) {

            let query = url.parse(request.url,true).query;

            getRoutes[incomingUrl](response, {"body": query, "routes": {"postRoutes": incomingUrl, "getRoutes": getRoutes}});
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
