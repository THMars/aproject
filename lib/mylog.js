/**
 * Created by dingyang on 2016/11/4.
 */
var log = new ( require('bunyan').createLogger(
    {
        name: 'Mission'
    }
));


function userLog(options, user) {
    this.log = options.log.chiild({user:user});
}

