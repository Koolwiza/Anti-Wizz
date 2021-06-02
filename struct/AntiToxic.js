const {
    google
} = require('googleapis')

module.exports = class AntiToxic {
    constructor(apiKey = "", percent = 75) {
        this.api = apiKey
        this.percent = percent
    }

    async init(text) {

        let perspectiveURL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';

        let client = await google.discoverAPI(perspectiveURL).catch(err => {
            console.log(err)
        })

        let resource = {
            key: this.api,
            resource: {
                comment: {
                    text: text,
                },
                requestedAttributes: {
                    TOXICITY: {}
                },
            },
        }

        let res = await client.comments.analyze(resource).catch(c => {})

        let value = res?.data?.attributeScores?.TOXICITY?.spanScores[0]?.score?.value
        if(!value) return 0
        let percent = Math.round(value * 100)

        if (percent >= this.percent) return true
        else return false;

    }
}