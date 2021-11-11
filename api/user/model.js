const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10
const userSchema = new mongoose.Schema(
     {
          email: { type: String, lowercase: true, default: "" },
          password: { type: String, default: null },
          name: { type: String, default: null },
          mobile: { type: String, default: null },
          DOB:{type:String, default:null},
          shoppingPreference:{type:String,default:null},
          isDeleted: { type: Boolean, default: false },
          isActive: { type: Boolean, default: false },
          roleName: { type: String, default: null },
          resetExpire : { type:Date,default:null},
          resetkey: {type:String,default:null},
          image: { type: String, default: null },
          token: { type: String },
          createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
     },
     {
          timestamps: true,
     }
)

userSchema.pre('save', function (next) {
     var user = this
     if (!user.isModified('password')) return next()
     bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
       if (err) return next(err)
       bcrypt.hash(user.password, salt, function (err, hash) {
         if (err) return next(err)
         user.password = hash
         next()
       })
     })
   })
   
   userSchema.methods.comparePassword = function (candidatePassword, cb) {
     bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
       if (err) return cb(err)
       cb(null, isMatch)
     })
   }
var user = mongoose.model("user", userSchema);
module.exports = user;