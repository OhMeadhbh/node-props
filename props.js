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