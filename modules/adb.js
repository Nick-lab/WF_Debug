const Promise = require('bluebird');
const usb = require('usb');
const adb = require('adbkit');
var client = adb.createClient();
module.exports.process = (e, obj) => {
    
    if(obj.action){
        if(obj.action == 'list'){
            listDevices(e)
        }
    }
}

function listDevices(event = false){
    client.listDevices().then((devices)=>{
        return Promise.filter(devices, (device)=>{
            return new Promise((res)=>{
                device.properties = {};
                let count = 0;
                client.shell(device.id, 'getprop ro.product.model').then(adb.util.readAll).then((output)=>{ 
                    ++count;
                    device.properties.model = output.toString().trim()
                    count == 4 ? res(device) : null;
                })
                client.shell(device.id, 'getprop ro.product.manufacturer').then(adb.util.readAll).then((output)=>{
                    ++count;
                    device.properties.manufacturer = output.toString().trim()
                    count == 4 ? res(device) : null;
                })
                client.shell(device.id, 'getprop ro.build.version.release').then(adb.util.readAll).then((output)=>{
                    ++count;
                    device.properties.android_version = output.toString().trim()
                    count == 4 ? res(device) : null;
                })
                client.shell(device.id, 'getprop ro.build.version.sdk').then(adb.util.readAll).then((output)=>{
                    ++count;
                    device.properties.sdk = output.toString().trim()
                    count == 4 ? res(device) : null;
                })
            })
        })
    }).then((data)=>{
        let tmp = {
            action: 'list-devices',
            data
        };
        console.log(tmp);
        if(event){
            event.sender.send('adb-reply', tmp)
        }else{
            global.windows['main-window'].webContents.send('adb-reply', tmp);
        }
    })
}

module.exports.attach = (ipc) => {
    usb.on('attach', ()=>{
        console.log('device attached')
        setTimeout(listDevices, 2000);
    })
    usb.on('detach', ()=>{
        console.log('device detached')
        listDevices()
    })
}