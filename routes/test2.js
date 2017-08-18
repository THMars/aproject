var express = require("express");
var router = express.Router();

router.get('/',function (req,res) {
    res.render('test3.ejs',{
        title: '协同会战',
        userInfo: JSON.stringify(req.userInfo)
    })
});

module.exports = router;