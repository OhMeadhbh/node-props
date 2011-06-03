// testProps.js
// Copyright (c) 2011, Meadhbh S. Hamrick
// All Rights Reserved
//
// Please see https://github.com/OhMeadhbh/node-props/blob/master/LICENSE
// for license information.

var props  = require( '../node-props' );
var assert = require( 'assert');
var fs     = require( 'fs' );
var propsPath = './properties.json';

try {
    fs.unlinkSync( propsPath );
} catch ( e ) {}

exports.testReadFileNull = function ( ) {
    props.readFile();
};

exports.testReadFileWithoutProperties = function ( beforeExit ) {
    var testThis;
    
    var propsCallback = function ( location, properties ) {
        testThis = properties;
    };
    
    props.readFile( propsCallback );
    
    beforeExit( function () {
        assert.isDefined( testThis );
        assert.type( testThis, 'object' );
        assert.equal( 0, propertiesCount( testThis ) );
    });
};

exports.testReadFileWithProperties = function ( beforeExit ) {
    var contents = '{"one":null,"two":23.3}';
    var testThis;
    
    var propsCallback = function ( location, properties ) {
        testThis = properties;
    };
    
    var writeFileCallback = function( err ) {
        props.readFile( propsCallback );
    };
    
    fs.writeFile( propsPath, contents, writeFileCallback );
    
    beforeExit( function () {
        assert.isDefined( testThis );
        assert.type( testThis, 'object' );
        assert.equal( 2, propertiesCount( testThis ) );
        assert.equal( null, testThis.one );
        assert.equal( 23.3, testThis.two );
    });
};

exports.testReadFile = function ( beforeExit ) {
    var testThis;
    
    var propsCallback = function ( location, properties ) {
        testThis = properties;
    };
    
    props.readFile( propsCallback );
    
    beforeExit( function () {
        assert.isDefined( testThis );
        assert.type( testThis, 'object' );
        assert.equal( null, testThis.one );
    }); 
};

exports.testFileURIToPathWeirdness = function () {
    assert.equal( propsPath, props.fileURIToPath() );
    assert.equal( propsPath, props.fileURIToPath('') );
    assert.equal( propsPath, props.fileURIToPath('wubba') );
};

exports.testFileURIToPath = function () {
    assert.equal( '.', props.fileURIToPath('file://') );
    assert.equal( propsPath, props.fileURIToPath('file://properties.json'));
    assert.equal( './whatever.txt', props.fileURIToPath('file://whatever.txt'));
    assert.equal( '/etc/passwd', props.fileURIToPath('file:///etc/passwd'));
};

exports.testReadHTTPNull = function ( beforeExit ) {
    var testThis;
    
    var propsCallback = function ( location, properties ) {
        testThis = properties;
    };
    
    props.readHTTP( propsCallback );
    
    beforeExit( function () {
        assert.isDefined( testThis );
        assert.type( testThis, 'object' );
        assert.equal( 0, propertiesCount( testThis ) );
    }); 
};

exports.testReadHTTP404 = function ( beforeExit ) {
    var testThis;
    
    var propsCallback = function ( location, properties ) {
        testThis = properties;
    };
    
    props.readHTTP( propsCallback, 'http://in5.us/thisFileDoesntExist.json' );
    
    beforeExit( function () {
        assert.isDefined( testThis );
        assert.type( testThis, 'object' );
        assert.equal( 0, propertiesCount( testThis ) );
    }); 
};

exports.testRead = function ( beforeExit ) {
    var testThis;
    
    var propsCallback = function ( location, properties ) {
        testThis = properties;
    };
    
    props.readHTTP( propsCallback, 'http://in5.us/test/properties.json' );
    
    beforeExit( function () {
        assert.isDefined( testThis );
        assert.type( testThis, 'object' );
        assert.equal( 2, propertiesCount( testThis ) );
        assert.isDefined( testThis.a );
        assert.type( testThis.a, 'object' );
        assert.equal( null, testThis.a );
        assert.isDefined( testThis.b );
        assert.type( testThis.b, 'boolean');
        assert.equal( true, testThis.b );
    }); 
};

function propertiesCount ( anObject ) {
    var count = 0;
    for( var i in anObject ) { count++; }
    return( count );
}
