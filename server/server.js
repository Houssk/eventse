#!/usr/bin/env node

var main = require('./main');
main.set('port', 8000);

var server = main.listen(main.get('port'), function() {
  console.log('Eventse server listening on port ' + server.address().port);
});
