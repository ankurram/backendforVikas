const Response = require('../../lib/commanService/response'),
      constants = require('../../lib/constant/constant'),
      User = require('./model'),
      query = require('../../lib/commanService/common_query'),
      jwt = require('jsonwebtoken'),
      moment = require('moment'),
      utility = require("../../lib/commanService/utility"),
      mongoose = require('mongoose'),
      catchAsync = require('../../lib/commanService/catchAsync'),
      sendMail = require('../../lib/commanService/mailer'),
      config = require('../../config/config').get(
        process.env.NODE_ENV || 'local'
      )

exports.userSignup = async (req, res) => {
  console.log("this is form",req.body);
  // return false;
  if(Object.keys(req.body).length === 0){
    return res.json(Response(constants.statusCode.unauth, constants.validateMsg.requiredFieldsMissing))
    } if (!req.body.email)
    return res.json(Response(constants.statusCode.unauth, constants.validateMsg.emailRequired))
    if (!req.body.password)
    return res.json(Response(constants.statusCode.unauth, constants.validateMsg.passwordRequired))
    // if (!req.body.role_name)
    // return res.json(Response(constants.statusCode.unauth, constants.messages.roleNameErrorMsg));
    const condition = { email: req.body.email }
    // const convertRole = req.body.role_name.toUpperCase();
    let finalResult = await query.findoneData(User, condition);
    console.log("this is final result",finalResult)
    if(finalResult.data == null){
        let registerObj ={
            email: req.body.email ? req.body.email.trim().toLowerCase() : "",
            password: req.body.password ? req.body.password : "",
            DOB: req.body.DOB ? req.body.DOB : "",
            shoppingPreference : req.body.shoppingPreference
        }

        let userOBJ = await query.uniqueInsertIntoCollection(User, registerObj);
      
        if (userOBJ.status && userOBJ.userData) {
         return res.json(
           Response(
             constants.statusCode.ok,
             constants.messages.signupSuccess,
           )
         );
        }else{
         return res.json(
           Response(
             constants.statusCode.internalservererror,
             constants.validateMsg.internalError,
           )
         );
        }     
    }else{     
       return res.json(
         Response(
            constants.statusCode.alreadyExist,
            constants.messages.emailAlreadyExist,
         )
       );
    }
}

exports.userLogin = async (req, res) => {
  console.log("this is login",req.body)
  if (Object.keys(req.body).length === 0 && req.body.constructor === Object)
  return res.json(Response(constants.statusCode.unauth, constants.validateMsg.requiredFieldsMissing))
  if (!req.body.email)
  return res.json(Response(constants.statusCode.unauth, constants.validateMsg.emailRequired))
  if (!req.body.password) 
  return res.json(Response(constants.statusCode.unauth, constants.validateMsg.passwordRequired))
  const condition = { email: req.body.email }

   let finalResult = await query.findoneWithPopulate(User, condition, '')
   if (!finalResult.status) {
     return res.json(
       Response(constants.statusCode.internalservererror, constants.messages.internalservererror)
     )
   }
   
   if (!finalResult.data) {
     return res.json(
       Response(constants.statusCode.internalservererror, constants.messages.userNotFound)
     )
   }
   
   const userInfo = finalResult.data
   
  //  if (!userInfo.isActive)
  //    return res.json(Response(constants.statusCode.forbidden, constants.messages.accountNotActive))
   
   if (userInfo.isDeleted)
     return res.json(Response(constants.statusCode.notFound, constants.messages.accountdeleted))
   
   userInfo.comparePassword(req.body.password, async function (err, isMatch) {
     if (err) {
       return res.json(
         Response(constants.statusCode.internalservererror, constants.messages.internalError)
       )
     }
     if (isMatch) {
       const params = {
         user_id: userInfo._id,
       }
       const expirationDuration = 60 * 60 * 24 * 15
       // expiration duration format sec:min:hour:day. ie: 8 Hours as per i/p
       const jwtToken = jwt.sign(params, constants.cryptoConfig.secret, {
         expiresIn: expirationDuration,
       })
   
       // Deleting password in response object
       userInfo.password = undefined
   
       const finalObjectToBeSend = {
         token: jwtToken,
         userInfo,
       }
   
       return res.json(
         Response(constants.statusCode.ok, constants.messages.loginSuccess, finalObjectToBeSend)
       )
     } else {
       return res.json(
         Response(constants.statusCode.unauth, constants.validateMsg.invalidEmailOrPassword)
       )
     }
   })
}

exports.sendForgotMail = catchAsync(async(req,res) =>{
  if (!req.body.email)
  return res.json(Response(constants.statusCode.unauth, constants.validateMsg.emailRequired))
  var condition = {
    email: req.body.email,
    isDeleted: false
  }
  var fields = {
    firstName: 1,
    lastName: 1,
    _id: 1,
    email: 1,
    isDeleted: 1,
    isActive: 1,
  };
  var userResult = await query.findoneData(User,condition,fields)
  console.log("this is final ",userResult)

  if(userResult.status && userResult.data){
      var condition = {
       _id: userResult.data._id,
      };
      var updateData = {
         resetkey: "",
       };
          // console.log("this is user obj",updateData)
      updateData.resetkey = utility.uuid.v1(); 
      updateData.resetExpire = travelTime = moment().add(11, 'minutes').format('YYYY-MM-DD HH:mm');  
      console.log("this is update data",updateData)
      let updateKey = await query.updateOneDocument(
        User,
        condition,
        updateData
      );
      console.log("this is update key",updateKey)
      if (updateKey.data._id) {
        var printContents= {
          "firstName": updateKey.data.firstName,
          "email":req.body.email,
          "link":config.baseUrl + "reset-password/" + updateKey.data.resetkey
      }
 
       console.log("this is print data",printContents);
      sendMail.sendResetEmail("forgot-password mail",
       printContents,
       async function (err, resp) {
         if (err) {
          return res.json(
            Response(
              constants.statusCode.internalservererror,
              constants.validateMsg.internalError,
            )
          );
         } else {
           res.json(
             Response(
               constants.statusCode.ok,
               constants.messages.forgotPasswordSuccess
             )
           );
         }
       }
     );
      }
  }else{
      return res.json(Response(constants.statusCode.notFound,constants.messages.userNotFound))
  }
})

exports.resetPassword = catchAsync(async(req,res) =>{
  if (req.body.password == "" || req.body.token == "") 
  return res.json(Response(constants.statusCode.unauth, constants.resetPassword_message.key_password_required))
  var condition = { resetkey: req.body.token };
  var fields = { _id: 1,resetExpire:1, };
  var userObj = await query.findoneData(User, condition, fields);
  console.log("this is reset key result",userObj)
  if (userObj.status && userObj.data) {
       console.log("this is new info",userObj.data);
       var date = moment(userObj.data.resetExpire)
        var now = moment();

        if (now > date) {
          return res.json(Response(constants.statusCode.ok, constants.resetPassword_message.reset_token_expire))
        } else {
          
          let hashValue = await query.saltThePassword(
            req.body.password
          );
          console.log("feture",hashValue)
          if(hashValue.status){
            let finalResult = await query.updateOneDocument(
              User,
              condition,
              { password: hashValue.value }
            );
            if (finalResult.status) {
              return res.json(Response(constants.statusCode.ok, constants.resetPassword_message.password_reset_success))
            }else{
              return res.json(
                Response(
                  constants.statusCode.internalservererror,
                  constants.validateMsg.internalError,
                )
              );
            }
          }
           // date is future
        }
  }else{
    return res.json(Response(constants.statusCode.unauth, constants.resetPassword_message.noExitToken))
  }

})


