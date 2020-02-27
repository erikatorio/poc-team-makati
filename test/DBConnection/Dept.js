const mongoose = require('mongoose');

const DeptSchema = new mongoose.Schema({
    user_grp:{
        type:String,
        trim: true,
        required: true
    },
});

const Dept = mongoose.model("tbl_dept", DeptSchema);
module.exports = Dept;