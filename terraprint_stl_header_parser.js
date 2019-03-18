const fs = require("fs");
const STL_HEADER_LEN = 80;
const TERRAPRINT_HEADER_FLAG = 207;

var filename = process.argv[2];
var printSize = process.argv[3];
var unit = process.argv[4];
var vertRes = process.argv[5]; //always in mm
fs.open(filename, 'r', function(err, fd){
	if(err){
		//TODO file does not exist or you lack permissions
		console.err("cant open file... "+err.stack);
	}else{
		//var buf = Buffer.alloc(STL_HEADER_LEN);
		var buf = new Buffer(STL_HEADER_LEN);
		fs.read(fd, buf, 0, STL_HEADER_LEN, 0, function(err, bytesRead, buffer){
			if(err){
				//TODO
				console.err("cant read file... "+err.stack);
				return;
			}
			parseHeader(buffer);
			fs.close(fd);
		});
	}
});

function parseHeader(buffer){
	var headerFlag = buffer.readUInt8(0);
	if(headerFlag !== TERRAPRINT_HEADER_FLAG){
		//complain
		console.err("unrecognized header format");
		//return;
	}

	//nw coords sit on the origin
	var nwLat = buffer.readFloatLE(1); console.log("nw lat: "+nwLat);
	var nwLon = buffer.readFloatLE(5); console.log("nw lon: "+nwLon);
	var seLat = buffer.readFloatLE(9); console.log("se lat: "+seLat);
	var seLon = buffer.readFloatLE(13);console.log("se lon: "+seLon);

	var neLat = nwLat;	console.log("seLat: "+neLat);
	var neLon = seLon;	console.log("neLon: "+neLon);

	var swLat = seLat;	console.log("swLat: "+swLat);
	var swLon = nwLon;	console.log("swLon: "+swLon);

	var resolution = buffer.readFloatLE(17); console.log("resolution (m/pix): "+resolution);
	var lengthPix = buffer.readInt32LE(21);  console.log("length (pix): "+lengthPix);
	var widthPix = buffer.readInt32LE(25);   console.log("width (pix): "+widthPix);
	var maxAlt = buffer.readInt32LE(29);	 console.log("high point (m): "+maxAlt);
	var minAlt = buffer.readInt32LE(33);	 console.log("low point (m): "+minAlt);

	var lengthMeters = resolution * lengthPix; console.log("length (m) "+lengthMeters);
	var widthMeters = resolution * widthPix; console.log("width (m): "+widthMeters);

	//TODO figure out longer side from coords and correspond that to length/width
	var latDist = Math.abs(nwLat - seLat);
	var lonDist = Math.abs(nwLon - seLon);
	if(latDist > lonDist && lengthPix > widthPix){
		//length => lat
	}
	else if(latDist > lonDist && lengthPix < widthPix){
		//width => lat
	}
	else if(latDist < lonDist && lengthPix > widthPix){
		//length => lon
	}
	else if(latDist < lonDist && lengthPix < widthPix){
		//width => lon
	}
	else{//perfectly equal? doubtful with floating point error, maybe use a range
		//dont actually know in this case...
	}
	
	var planetNameLen = buffer.readUInt8(37);	console.log("planet name len: "+planetNameLen);
	var planetName = buffer.toString('ascii', 38, 38+planetNameLen);	console.log("plane name: "+planetName);

	var coordSysNameLen = buffer.readUInt8(38+planetNameLen);	console.log("coord sys name len: "+coordSysNameLen);
	var coordSysName = buffer.toString('ascii', 38+planetNameLen+1, 38+planetNameLen+1+coordSysNameLen);	console.log("coord sys: "+coordSysName);

	//now print all

	//check for printSIze and unit to determine scale
	if(printSize && !isNaN(parseFloat(printSize)) && unit){
		printScale(printSize, unit);
	}
	if(vertRes && !isNaN(parseFloat(vertRes))){
		printVertResolution(vertRes);
	}

	function printScale(printSize, unit){
		var greaterSide = lengthMeters > widthMeters ? lengthMeters : widthMeters;
		//assuming that the greater side is scaled to the print size
		var metersPerUnit =  greaterSide / printSize;
		switch(unit){
			case "inch":
				console.log("horz scale 1 inch to "+metersPerUnit+" meters");
				break;
			case "cm":
				console.log("horz scale 1 cm to "+metersPerUnit+" meters");
				break;
			case "mm":
				console.log("horz scale 1 mm to "+metersPerUnit+" meters");
				break;
			default:
				console.log("unknown unit value, aborting scale computation");
		}
	}

	function printVertResolution(resolution){
		var altRange = maxAlt - minAlt;
		//need to know actual model height...
		//and thus number of layers
		//console.log(resolution);
		//console.log(altRange/resolution);
	}
}





