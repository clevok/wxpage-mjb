import {toast} from './actions';
const urlBase = "https://mianjiba.com/other/mjb/Home/";

export const get = (url, data={}) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url : urlBase+url,
            method: 'GET',
            data: {...data},
            header: {
                token: ''
            },
            success(res) {
                if(res.data.error_code != 0) {
                    return reject(res.data);
                }
                resolve(res.data);
            },
            fail(res) {
                toast.error('网络故障');
                reject(res);
            }
        })
    })
}

export const post = (url, data={}) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url : urlBase+url,
            method: 'POST',
            data: {...data},
            header: {
                // 'content-type': 'application/x-www-form-urlencoded', // 默认值
                token: ''
            },
            success(res) {
                if(res.data.error_code != 0) {
                    return reject(res.data);
                }
                resolve(res.data);
            },
            fail(res) {
                toast.error('网络故障');
                reject(res);
            }
        })
    })
}

export const upload = (path='', formData)=> {
    return new Promise((resolve, reject)=> {
        if(!path) {
            return reject('');
        }
        wx.uploadFile({
            url : urlBase+'ImgUpload/upload',
            filePath: path,
            name: 'file',
            formData,
            success: function(res){
                let result = JSON.parse(res.data);
                if(result.error_code != 0) {
                    return reject(result);
                }
                resolve(result);
            },
            fail(res) {
                reject(res);
            }
        })
    })
}
