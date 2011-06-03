# node-props

This package lets application users specify one or more URLs to JSON files
containing "application properties." After the files are read and deserialized,
a programmer supplied callback is executed. The module provides the function:

  props.read( callback );

which reads the command line arguments looking for the string '--config'. The
parameter following the config file is a file:, http: or https: URI. You
can use multiple --config flags to specify multiple resources. Each resource
will be read in order and combined into a single object that is passed to the
callback.

I use this feature to separate hardware specific properties from application
specific properties. I usually have hardware specific properties (like IP
addresses and ports to listen on) in files on the filesystem while application
specific properties (names of DB servers, application timeouts, etc.) in 
http resources on our internal net. This is useful if you're running the same
application on several different machines.

## Installation

The easiest way to install this package is to use npm:

<pre>    npm install node-props</pre>

If you want to check out the source, use the git command:

<pre>    git clone git://github.com/OhMeadhbh/node-props.git</pre>

## Usage (for end users)

This package is intended to allow a node application user to do something like
this:

<pre>    node application.js \
      --config file:///etc/application.json \
      --config http://example.com/application.json</pre>

and then have the system will pull properties from both the local file and
the remote server (example.com), munge them together in the same object and
start the main body of the application.

## Usage (for developers)

To use the module, simply import the package can call the read() function. Ex:

<pre>    var props = require('node-props');
    props.read( function ( properties ) {
      console.log( 'started this app with the following props:');
      console.log( JSON.stringify( properties ) );
    } );</pre>

## Tests

There are expresso.js compatible tests in the test directory. Bonus points if
you add to the test suite.

## License

This package is released under a MIT license, the text of which may be found
at https://github.com/OhMeadhbh/node-props/raw/master/LICENSE .