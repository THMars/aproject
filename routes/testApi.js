var express = require('express');
var router = express.Router();
var fs = require("fs");
router.get("/",function (req,res) {
    fs.readFile("./lib/res.json",function (err,data) {
        res.send(JSON.parse(data));
    })
});


module.exports = router;