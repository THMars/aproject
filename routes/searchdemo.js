'use strict';
let express = require('express');
let router = express.Router();

router.post('/',(req,res,next)=>{
    res.send("成功");
})

module.exports = router; 