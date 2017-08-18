/**
 * Created by dingyang on 2016/12/12.
 */
'use strict';
const crypto = require('crypto');
class MyCrypto {
    static encrypto(data, password) {
        const crypto = require('crypto');
        const cipher = crypto.createCipher('aes256', password + MyCrypto.key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    static decrypto(data, password) {
        const decipher = crypto.createDecipher('aes256', password + MyCrypto.key);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        // console.log(decrypted);
        return decrypted;
    }
}

MyCrypto.key = 'ultiwill2016';

// console.log(MyCrypto.encrypto('12312312','1'));
//  console.log(MyCrypto.decrypto('c702eb235a6efd49cd00fb8ac945970d','1'));

module.exports = MyCrypto;
