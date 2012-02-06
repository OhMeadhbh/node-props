// props.js
// Copyright (c) 2011-2012, Meadhbh S. Hamrick
// All Rights Reserved
//
// Please see https://github.com/OhMeadhbh/node-props/blob/master/LICENSE
// for license information.

// This module reads JSON files specified by file, http or https URIs on
// the command line.

( function ( ) {
    var props = {};
    var propsPath = './properties.json';
    var fs = require( 'fs' );
    var http = require( 'http' );
    var https = require( 'https' );
    var url = require( 'url' );
    
    if( module && module.exports ) {
        module.exports = props;
    }

    // function: props.read( callback )
    //
    // Parse the command line arguments looking for --config flags. Treat
    // the following parameters as URIs to parse.

    props.read = function ( callback ) {
    	var resources = [];
    	
    	function copyProps ( dest, src ) {
    		if( dest && src ) {
    			for( var i in src ) {
    				dest[i] = src[i];
    			}
    		}
    	};

    	function readCallback ( location, properties ) {
    		for( var i = 0; i < resources.length; i++ ) {
    			if( resources[i].uri == location ) {
    				resources[i].contents = properties;
    			}
    		}

    		if( resources.every( function( e ) { return( e.contents !== undefined ); } ) ) {
    			var endProps = {};
    			for( var i = 0; i < resources.length; i++ ) {
    				copyProps( endProps, resources[i].contents );
    			}
    			callback( endProps );
    		}
    	};
    	
    	// construct an array of objects to hold info about each resource.
    	// we don't fetch the resources here 'cause we want to be sure we
    	// know how many there are before we start processing I/O callbacks.
    	for( var i = 0; i < process.argv.length; i++ ) {
    		if( '--config' == process.argv[ i ] && (i + 1) < process.argv.length ) {
    			resources.push( { uri: process.argv[ ++i ] } );
    		}
    	}

    	// now read the resources
    	if( 0 === resources.length ) {
    		readCallback( null, {} );
    	} else {
    		for( var i = 0; i < resources.length; i++ ) {
    			var dispatch = {
    					'file': props.readFile,
    					'http': props.readHTTP,
    					'https': props.readHTTPS
    			};
    			var uri = resources[i].uri;
    			var scheme = (uri.split(':'))[0].toLowerCase();
    			dispatch[scheme] && dispatch[scheme](readCallback, uri);
    		}
    	}
    };

    // function: props.readFile( callback, fileURI )
    // 
    // Reads the contents of the file specified by fileURI, then calls
    // callback with their contents.

    props.readFile = function ( callback, fileURI ) {
        var filePath = props.fileURIToPath( fileURI );

        if( ! filePath ) {
            filePath = propsPath;
        }
        
        try {
            fs.readFile( filePath, 'utf8', function ( err, data ) {
                if( err ) {
                    callback && callback( fileURI, {} );
                } else {
                    callback && callback( fileURI, JSON.parse( data ) );
                }
            });
        } catch( e ) {
            callback && callback( fileURI, {} );
        }
    };
    
    // function: props.fileURIToPath( fileURI )
    //
    // This is a convenience function to convert a file URI into a file
    // path suitable for consumption by fs.readFile().

    props.fileURIToPath = function( fileURI ) {
        var rv = propsPath;
        
        if( fileURI ) {
            if( 'file://' == fileURI.substr( 0, 7 ) ) {
                rv = fileURI.substr( 7 );
                if( 0 == rv.length ) {
                    rv = ".";
                } else if( '/' != rv.substr( 0, 1 ) ) {
                    rv = './' + rv;
                }
            }
        }
        
        return( rv );
        
    };

    // function: props.readHTTP( callback, url )
    // function: props.readHTTPS( callback, url )
    //
    // Reads the resource specified by the url and attemtps to interpret its
    // results as JSON, then calls the callback with the resulting deserialized
    // object as a parameter.

    props.readHTTP = function ( callback, url ) {
        if( url ) {
            readWEB( callback, url, http );
        } else {
            callback && callback( url, {} );
        }
    };

    props.readHTTPS = function ( callback, url ) {
        if( url ) {
            readWEB( callback, url, https );
        } else {
            callback && callback( url, {} );
        }
    };

    // function readWEB( callback, location, client )
    //
    // This function is called by both readHTTP() and readHTTPS() and performs
    // the "heavy lifting" involved with executing the get request, handling
    // errors and calling the callback with the deserialized JSON object.
    
    var readWEB = function ( callback, location, client ) {
        try {
            var urlBits = url.parse( location );
            var path = url.format( {pathname: urlBits.pathname, search: urlBits.search, query: urlBits.query, hash: urlBits.hash } );
            var params = {host: urlBits.hostname, port: urlBits.port, path: path};

            client.get( params, function( response ) {
                var data = "";
                response.setEncoding('utf8');
                response.on( 'data', function( chunk ) {
                    data += chunk;
                });
                response.on( 'end', function( chunk ) {
                    try {
                        callback && callback( location, JSON.parse(data) );
                    } catch ( e ) {
                        callback && callback( location, {} );
                    }
                });
		} ).on('error',function ( err ) { callback && callback( location, {} ); } );
        } catch ( e ) {
            callback && callback( location, {} );
        }
    };
}());