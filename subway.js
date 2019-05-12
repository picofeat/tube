'use strict'

const fs = require('fs');
const csv = require('fast-csv');

var filename = 'lines.csv';
var targetDistance = 5;

if (process.argv.length >= 3) {
    filename = process.argv[2];
}

if (process.argv.length >= 4) {
    targetDistance = parseInt(process.argv[3]);
}

var stationsSet = new Set();
var routes = {};

var stream = fs.createReadStream("lines.csv");

var csvStream = csv()
    .on("data", function (data) {
        //console.log(data);
        if (data[0] !== 'Tube Line') {

            if (!routes[data[1]]) {
                routes[data[1]] = new Set();
            }
            routes[data[1]].add(data[2]);

            // the routes are clearly intended to be bidirectional as in a real world subway
            if (!routes[data[2]]) {
                routes[data[2]] = new Set();
            }
            routes[data[2]].add(data[1]);

            stationsSet.add(data[1]);
            stationsSet.add(data[2]);
        }
    })
    .on("end", function () {
        processRoutes();
    });

stream.pipe(csvStream);


function dump() {

    var routeArray = Object.keys(routes);
    var numRoutes = routeArray.length;

    console.log('Dump routes, '+ numRoutes +' routes total');

    for (var i = 0; i < numRoutes; i++) {
        var myStart = routeArray[i];
        var myDestinations = routes[myStart].values();

        for (var destStation of myDestinations) {
            console.log('From: ' + myStart + ' to: ' + destStation);
        }
    }

    var stations = Array.from(stationsSet);

    var numStations = stations.length;
    console.log('Dump station list, '+ stationsSet.size +' stations total');
    for (var i = 0; i < stations.length; i++) {
        console.log('Station: ' + stations[i]);
    }
}

function processRoutes() {

    //dump();

    var nextSet = new Set();
    var currentSet = new Set();
    var processed = {};
    var output = [];

    currentSet.add('East Ham')
    var distance = 0;

    while (distance <= targetDistance) {

        var stationIterator = currentSet.values();

        for (var currentStation of stationIterator) {
            //console.log('Processing: ' + currentStation);

            // use javascript spread notation to merge the sets
            nextSet = new Set([...nextSet, ...(routes[currentStation])])

            if (typeof processed[currentStation] === 'undefined') {
                //console.log('Adding '+currentStation+' distance: '+distance);
                processed[currentStation] = distance;

                if (distance === targetDistance) {
                    output.push(currentStation);
                }
            }
        }

        distance++;

        currentSet = nextSet;
        nextSet = new Set();
    }

    console.log(output.sort());
}

