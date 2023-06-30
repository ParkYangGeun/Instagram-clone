const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const followSchema = new Schema({
  // 팔로우한 유저
  follower : {type : Schema.ObjectId, required : true, ref : "User"},
  // 팔로우 받은 유저
  following : {type: Schema.ObjectId, required : true, ref : "User" }
},{
  toJSON:{virtuals: true},
  toObject:{virtuals:true}
})

module.exports = mongoose.model("Follow", followSchema);