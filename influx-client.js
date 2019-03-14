const request = require('request')

const config = {
    BAppApiKey: 'blablabla',
    BAppApiURL: 'http://localhost:8086',
    InfluxEndpoint: '/write',
    InfluxEndpointHistory: '/write',
    InfluxExtraOptions: {
        "qs": {
            "db": "telemetry",
            "rp": "stream_rp",
            "precision": "s",
        }
    },
}
const logger = console

/* ****************************************** */
// ApiClient
/* ****************************************** */

class ApiClient {
    constructor(apiKey, url) {
        // Options
        this.request = request.defaults({
            baseUrl: url,
            headers: { 'api-key': apiKey },
            qs: { precision: 'ms' },
        })

        this.endpoint = config.InfluxEndpoint
        this.history_endpoint = config.InfluxEndpointHistory || `/measurements/write/history`
        this.opts = config.InfluxExtraOptions

        this.active = Boolean(apiKey && url && apiKey !== 'undefined' && url !== 'undefined')
    }

    writeMeasurementsNow(readings = [], callback = () => { }) {
        let points = 0
        const r1 = this.request.post(this.endpoint, this.opts, (error, response, body) => {
            if (error || response.statusCode < 200 || response.statusCode > 299) logger.error(`Insert request failed with: ${error}, ${body}`)
            else {
                logger.debug(`Measurements Write request completed (statusCode: ${response.statusCode}) for ${points} data points. Body: ${body}`)
            }
            callback()
        })

        for(let reading of readings) {
            let sourceId = reading['sourceId']
            let trackingId = reading['trackingId']
            let rssi = reading['rssi']
            let timestamp = reading['timestamp']
            if (!trackingId.includes(':')) {
                let dataLine = `telemetry,trackingId=${trackingId},sourceId=${sourceId} rssi=${rssi} ${timestamp}\n`
                r1.write(dataLine)
                points++
                // logger.log(dataLine.replace('\n', ''))
            }
        }

        // End Data Stream
        r1.end()
    }
}

/* ****************************************** */
// Exports
/* ****************************************** */

module.exports.influx = new ApiClient(config.BAppApiKey, config.BAppApiURL)
module.exports.ApiClient = ApiClient
