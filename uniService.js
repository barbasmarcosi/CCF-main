var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Backend',
  script: 'C:\\Sistema\\index.js',
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

svc.uninstall();