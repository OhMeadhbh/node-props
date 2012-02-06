// nonExpressoTest.js
//
// This is a simple app to test the props.read() function. If we call it with no arguments,
// it launches a simple http server and then calls itself first with just --http, then with
// just --file and then with both --http and --file.

var props  = require( '../node-props' );
var fs     = require( 'fs' );
var http   = require( 'http' );
var assert = require( 'assert' );

var doFile = false;
var doHttp = false;
var doNone = false;

var app;

for( var i = 0, il = process.argv.length; i < il; i++ ) {
	switch( process.argv[i] ) {
	case '--file':
		doFile = true;
		break;
		
	case '--http':
		doHttp = true;
		break;
	
	case '--none':
		doNone = true;
		break;
	}
}

if( ! ( doFile || doHttp || doNone ) ) {
	// Read the testProperties.json file
	var tempBuf = new Buffer(8192);
	var bytesRead = fs.readSync( fs.openSync( './testProperties.json', 'r', 0666 ), tempBuf, 0, 8192, 0 );
	var testProps = tempBuf.slice(0, bytesRead).toString( 'utf8' );

	app = http.createServer( function( request, response ) {
		response.writeHead( 200, {'Content-Type': 'application/json; charset=utf-8', 'Content-Length': testProps.length} );
		response.end( testProps );
	} ).listen( 1180, '127.0.0.1' );
	
	var fin = 0;
	var spawn = require( 'child_process').spawn;
	
	function spawnHelper( obj, name ) {
		var stdout = "";
		var stderr = "";
		
		obj.on( 'exit', function( code ) {
			console.log( '%%PROPS-' + name + '; exit code is: ' + code );
			if( 0 !== code ) {
				console.log( '; stdout:\n' + stdout );
				console.log( '; stderr:\n' + stderr );
			}
			fin++;
			if( fin > 3 ) {
				app.close();
				process.exit(0);
			}
		} );
		
		obj.stdout.on( 'data', function( data ) {
			stdout += data;
		} );
		
		obj.stderr.on( 'data', function( data ) {
			stderr += data;
		} );
	}
	
	var n = spawn( process.argv[0], [ process.argv[1], '--none' ] );
	spawnHelper( n, 'NONE' );
	
	var f = spawn( process.argv[0], [ process.argv[1], '--file', '--config', 'file://fileProperties.json' ] );
	spawnHelper( f, 'FILE' );
	
	var h = spawn( process.argv[0], [ process.argv[1], '--http', '--config', 'http://127.0.0.1:1180/' ] );
	spawnHelper( h, 'HTTP' );

	var b = spawn( process.argv[0], [ process.argv[1], '--file', '--http', '--config', 'file://fileProperties.json', '--config', 'http://127.0.0.1:1180/' ] );
	spawnHelper( b, 'BOTH' );
} else {
	// read props
	props.read( function ( p ) {
		assert.equal( typeof p, 'object', 'uh oh. read callback is supposed to get an object');
		var propsInP = 0;
		for( var a in p ) {
			propsInP++;
		}

		if( doNone ) {
			assert.equal( propsInP, 0, 'uh oh. there were props in the none properties object' );
		} else {
			if( doFile ) {
				assert.equal( typeof p.beta, 'object', 'beta is supposed to be null');
				assert.equal( p.beta, null, 'beta is supposed to be null');
			}
			
			if( doHttp ) {
				assert.equal( typeof p.one, 'object', 'one is supposed to be null');
				assert.equal( p.one, null, 'one is supposed to be null');
			}
		}
	} );
}
