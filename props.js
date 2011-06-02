// props.js
// Copyright (c) 2011, Meadhbh S. Hamrick
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

    // function: props.readFile( callback, filePath )
    // 
    // Reads the contents of the file specified by filePath, then calls
    // callback with their contents.

    props.readFile = function ( callback, filePath ) {
        var props = {};
        
        if( ! filePath ) {
            filePath = propsPath;
        }
        
        try {
            fs.readFile( filePath, 'utf8', function ( err, data ) {
                if( err ) {
                    callback && callback( {} );
                } else {
                    callback && callback( JSON.parse( data ) );
                }
            });
        } catch( e ) {
            callback && callback( {} );
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
            callback && callback( {} );
        }
    };

    props.readHTTPS = function ( callback, url ) {
        if( url ) {
            readWEB( callback, url, https );
        } else {
            callback && callback( {} );
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
            client.get({method: 'GET', host: urlBits.host, port: urlBits.port, path: path}, function( response ) {
                var data = "";
                response.setEncoding('utf8');
                response.on( 'data', function( chunk ) {
                    data += chunk;
                });
                response.on( 'end', function( chunk ) {
                    try {
                        callback && callback( JSON.parse(data) );
                    } catch ( e ) {
                        callback && callback( {} );
                    }
                });
            } ).on('error',function ( err ) { callback && callback( {} ); } );
        } catch ( e ) {
            callback && callback( {} );
        }
    };
}());