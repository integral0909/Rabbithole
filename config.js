'use strict';

var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var extend = require('node.extend');



function Configuration() {}

Configuration.cronQueryLimitForPremium = 100;
/**
 * FB secret
 */

//  Configuration.fb_secret = "3c02cb0c92f0a0511f6d5b17ae2458ba";
 Configuration.fb_secret = "342e813b0bce0585d84e4e729750544d";

/**
 * Twilio
 */
//Real
Configuration.twilio = {
    accountSid: "",
    authToken: "",
    sendingNumber: ""
};
//Test


Configuration.awsEmailSender = {
    region: '',
    accessKeyId: '',
    secretAccessKey: ''

};

Configuration.send_mail = "";

Configuration.appstoreUrl = "https://itunes.apple.com/us/app/dealspl.us-coupons/id496056416?mt=8";
Configuration.googleUrl = "https://itunes.apple.com/us/app/dealspl.us-coupons/id496056416?mt=8";
/*
 * Document Root
 * @static
 * @readonly
 * @property DOCUMENT_ROOT
 * @type {String}
 */
Configuration.DOCUMENT_ROOT = __dirname;

/*
 * The model files absolute path
 * @private
 * @static
 * @readonly
 * @property LOG_DIR
 * @type     {String}
 */
Configuration.MODEL_DIR = path.join(__dirname, 'models');

/*
 * @private
 * @static
 * @readonly
 * @property LOG_DIR
 * @type     {String}
 */
var LOG_DIR = path.join(Configuration.DOCUMENT_ROOT, 'log');

/*
 * The default logging directory absolute path
 * @private
 * @static
 * @readonly
 * @property LOG_File
 * @type     {String}
 */
var LOG_File = path.join(LOG_DIR, 'RabbitHole.log');

/*
 * The configuration module overrides file name
 * @private
 * @static
 * @readonly
 * @property CONFIG_MODULE_NAME
 * @type     {String}
 */
var CONFIG_MODULE_NAME = 'config.js';

/*
 * The default list of absolute file path to try when loading the configuration 
 * @private
 * @static
 * @readonly
 * @property OVERRIDE_FILE_PATHS
 * @type     {Array}
 */
var OVERRIDE_FILE_PATHS = [
    path.join(Configuration.DOCUMENT_ROOT, CONFIG_MODULE_NAME),
];

/*
 * Retrieve the base configuration
 */

Configuration.getBaseConfig = function(multisite) {
    return {
        siteName: 'RabbitHole',
        product: 'RabbitHole',
        siteRoot: 'http://localhost:3000',
        siteIP: '0, 0, 0, 0',
        sitePort: process.env.port || process.env.PORT || 8080,
        multisite: {
            enabled: false,
            globalRoot: 'http://global.localhost:8080'
        },
        db: {
            type: 'mongodb',
            servers: [
                '127.0.0.1:27017'
                //''
            ],
            name: 'RabbitHole',
            options: {
                w: 1
            },
            //PB provides the ability to log queries.  This is handy during
            //development to see how many trips to the DB a single request is
            //making.  The queries log at level "info".
            query_logging: false,

            //http://mongodb.github.io/node-mongodb-native/api-generated/db.html#authenticate
            authentication: {
                un: null,
                pw: null,
                options: {
                    //authMechanism: "MONGODB-CR"|"GSSAPI"|"PLAIN", //Defaults to MONGODB-CR
                    //authdb: "db name here", //Defaults to the db attempted to be connected to
                    //authSource: "db name here", //Defaults to value of authdb
                }
            },

            skip_index_check: false,
        },
        appData: {
            product: 'RabbitHole'
        },
        cache: {
            fake: true,
            host: 'localhost',
            port: 6379
        },
        session: {
            storage: 'redis',
            timeout: 2000000
        },
        logging: {
            level: 'info',
            file: LOG_File,
            showErrors: true
        },
        settings: {
            use_memory: true,
            use_cache: false,
            memory_timeout: 0
        },
        templates: {
            use_memory: true,
            use_cache: false,
            syncSettingsAtStartup: false,
            memory_timeout: 0
        },
        registry: {
            enabled: true,
            logging_enabled: false,
            type: 'redis',
            update_interval: 10000,
            key: 'server_registry'
        },
        cluster: {
            fatal_error_timeout: 2000,
            fatal_error_count: 5,
            workers: 1,
            self_managed: true
        },
        server: {
            ssl: {
                enabled: false,
                handoff_port: 8080,
                handoff_ip: '0.0.0.0',
                use_x_forwarded: false,
                use_handoff_port_in_redirect: false,
                key: 'ssl/key.pem',
                cert: 'ssl/cert.crt',
                chain: null
            },
            x_powered_by: 'RabbitHole'
        },
        command: {
            borker: 'redis',
            timeout: 3000
        },
        media: {
            provider: 'fs',
            parent_dir: 'public',
            urlRoot: '',
            max_upload_size: 2 * 1024 * 1024
        },
        localization: {
            defaultLocale: 'en-US'
        },
        version: require(path.join(Configuration.DOCUMENT_ROOT, 'package.json')).version
    };
};

Configuration.load = (filePaths) => {
    if (filePaths != undefined) {
        filePaths = [filePaths];
    } else if (!filePaths) {
        filePaths = OVERRIDE_FILE_PATHS;
    }

    var override = {};
    var overrideFile = null;
    var overridesFound = false;
    for (var i = 0; i < filePaths.length; i++) {
        overrideFile = filePaths[i];
        if (fs.existsSync(overrideFile)) {
            try {
                override = require(overrideFile);
                overridesFound = true;
                break;
            } catch (e) {
                console.log('SystemStartup: Failed to parse configruartion file [%s]: %s', overrideFile, e.stack);
            }
        }
    }

    return Configuration.mergeWithBase(override);
};

Configuration.mergeWithBase = (overrides) => {
    var multisite = overrides && overrides.multisite ? overrides.multisite.enabled : false;
    var baseConfig = Configuration.getBaseConfig(multisite);
    var config = extend(true, baseConfig, overrides);

    if (config.siteRoot.lastIndexOf('/') === (config.siteRoot.length - 1)) {
        config.siteRoot = config.siteRoot.substring(0, config.siteRoot.length - 1);
    }

    if (config.media.urlRoot.lastIndexOf('/') === (config.media.urlRoot.length - 1)) {
        config.media.urlRoot = config.media.urlRoot.substring(0, config.media.urlRoot.length - 1);
    }
    return config;
}

module.exports = Configuration;