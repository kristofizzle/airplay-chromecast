/* eslint-env node */
'use strict'

var mdns = require('mdns')
var AirPlay = require('./airplay')
var debug = require('debug')('airplay-chromecast')

var AirPlayServers = {}

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
  if (!(service.name in AirPlayServers)) {
    AirPlayServers[service.name] = new AirPlay()
    AirPlayServers[service.name].announce(service)
  }
})

browser.on('serviceDown', function (service) {
  debug('serviceDown for device "%s"', service.name)
  if (service.name in AirPlayServers) {
    AirPlayServers[service.name].stop()
    delete AirPlayServers[service.name]
  }
})

browser.start()
