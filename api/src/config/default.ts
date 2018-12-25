export = {
    queue: {
        windows: ['1', '2', '3'],
        refreshInterval: 500,
        fillQueueSize: 7,
        minServiceTime: 10 * 1000,
        maxServiceTime: 30 * 1000
    },
    logging: {
        appenders: {
            out: {
                type: 'console'
            },
            file: {
                type: 'dateFile',
                filename: './logs/api.log',
                pattern: '-yyyy-MM-dd'
            }
        },
        replaceConsole: true,
        categories: {
            default: {
                appenders: ['out', 'file'],
                level: 'ALL'
            }
        }
    },
    port: 8000,
    specFilePath: './spec.yaml',
    mongo: {
        connectionString: 'mongodb://localhost:27017/botf',
        options: {}
    },
    token: {
        secret: 'FVSXhgPolUDtYnDgmcV1V1aYJMpwjasFf2wejFFP'
    },
    sms: {
        enabled: false,
        senderPhoneNumber: '+14122135249',
        apikey: {
            SID: 'AC5ff65ef5fd062188421ca1df94fab57d',
            Token: 'ca07f6a520c5f048d2bb5633f9801f4b'
        }
    },
    user: {
        welcomeMessageText: 'Please install the application to access Downtown Clothes https://bit.ly/2jNpKA1'
    }
};