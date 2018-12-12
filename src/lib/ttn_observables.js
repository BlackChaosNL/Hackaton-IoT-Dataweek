const ttncreds = require("../models/ttn_user"),
    ttn = require("ttn"),
    data = require("../models/sensor"),
    supp = require("./ttn_support");

function startAll() {
    ttncreds.find({}).then((users) => {
        if (users.length <= 0) return;
        users.forEach(u => {
            ttn.data(u.ttn_user, u.ttn_secret).then(c => {
                c.on("uplink", (devId, payload) => {
                    if (payload.dev_id == null) return;
                    supp.translateTtnPayload(payload.payload_raw).forEach(item => {
                        sensor({
                            sensor_name: payload.dev_id,
                            sensor_id: item[0],
                            sensor_data: item[1],
                            sensor_time: payload.metadata.time
                        }).save();
                    });
                });
            }).catch(error => {
                ttncreds.findOneAndDelete({
                    ttn_user: u.ttn_user
                });
            });
        });
    });
}

function startOne(client, password) {
    ttn.data(client, password).then(c => {
        c.on("uplink", (devId, payload) => {
            if (payload.dev_id == null) return;
            supp.translateTtnPayload(payload.payload_raw).forEach(item => {
                data({
                    sensor_name: payload.dev_id,
                    sensor_id: item[0],
                    sensor_data: item[1],
                    sensor_time: payload.metadata.time
                }).save().catch((error) => {
                    console.error(error);
                });
            });
        });
    }).catch(error => {
        console.log(error);
    });
}

module.exports = {
    startAll,
    startOne
};