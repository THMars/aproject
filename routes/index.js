var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: '协同会战',
        userInfo: JSON.stringify(req.userInfo)
    });
});

// const jwt = require('jsonwebtoken');
// console.log(jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VyTmFtZSI6InQxIiwidXNlcklEIjoxMCwidXNlckRlcGFydG1lbnQiOiIiLCJleHAiOjE0ODE4NTk5MzV9LCJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeWJtRnRaU0k2SW5ReElpd2liM0pwWjE5cFlYUWlPakUwT0RFM056TTFNelVzSW5WelpYSmZhV1FpT2pFd0xDSmxiV0ZwYkNJNklpSXNJbVY0Y0NJNk1UUTRNVGcxT1Rrek5YMC5LZG9pTXNOVWxyYVFVTTVxbUVfZzU3ZTNPOVhqUktBOGx3NEUzYV9QX19VIiwib3JpZ19pYXQiOjE0ODE3NzM1MzUsImV4cCI6MTQ4MTg1OTkzNSwiaWF0IjoxNDgxNzg0MjEyfQ.Kf_v_hD3rbzfk5Qeo-llLJpOkqf-4uyLJPXoyFbilZk','test'))
module.exports = router;
