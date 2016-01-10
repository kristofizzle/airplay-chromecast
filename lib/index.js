/* eslint-env node */
'use strict'

var mdns = require('mdns')
var AirPlay = require('./airplay')
var debug = require('debug')('airplay-chromecast')

// Fix for getaddrinfo issues with ipv6:
// https://github.com/agnat/node_mdns/issues/130
var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
];
var browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence})

browser.on('serviceUp', function (service) {
  debug('found device "%s" at %s:%d', service.name, service.addresses[0], service.port)
  var airplay = new AirPlay()
  airplay.announce(service)
})

browser.start()
