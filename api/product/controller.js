const Response = require('../../lib/commanService/response'),
      constants = require('../../lib/constant/constant'),
      trip = require('./model'),
      query = require('../../lib/commanService/common_query'),
      jwt = require('jsonwebtoken'),
      moment = require('moment'),
      utility = require("../../lib/commanService/utility"),
      mongoose = require('mongoose'),
      catchAsync = require('../../lib/commanService/catchAsync'),
      sendMail = require('../../lib/commanService/mailer'),
      config = require('../../config/config').get(
        process.env.NODE_ENV || 'local'
      );

      exports.tripList = catchAsync(async(req,res) =>{
        const condition = { }
        let finalResult = await query.findData(trip, condition);
        console.log("this is data",finalResult) 
        if(finalResult.status){
        return res.json(
            Response(
              constants.statusCode.ok,
              finalResult
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
    })

      exports.tripDetails = async (req, res) => {
        const condition = {_id:req.body.id }
        let finalResult = await query.findoneData(trip, condition);
        // console.log("thsi si s id",finalResult)
        if(finalResult.status){
          return res.json(
              Response(
                constants.statusCode.ok,
                finalResult
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
    
    }

      exports.saveTrips = catchAsync(async(req,res) =>{
         console.log("this is save info",req.body)
        const condition = { tripName: req.body.name }
        let finalResult = await query.findoneData(trip, condition);
        if(finalResult.data == null){
            let registerObj ={
                tripName: req.body.name,
                location: req.body.location,
                price: 100,
                
            }
    
            let userOBJ = await query.uniqueInsertIntoCollection(trip, registerObj);
            if (userOBJ.status && userOBJ.userData) {
                return res.json(
                  Response(
                    constants.statusCode.ok,
                    "Trip is save",
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
        }
    })

    exports.searchTrip = catchAsync(async(req,res) =>{
      console.log("this is search",req.params)
      let condition = {  }
      const searchText = decodeURIComponent(req.body.search).replace(
         /[[\]{}()*+?,\\^$|#\s]/g,
         '\\s+'
      )
      condition.$or = [
         { tripName: new RegExp(searchText, 'gi') },
         // { stateName: new RegExp(searchText, 'gi') },
      ]

      let productData = await query.findAvailabilityDataBySort(trip,condition);
       console.log("this is data",productData)
       if(productData.status && productData.data )
       {
          return res.json(
              Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, productData.data)
            ) 
       }else{
          return res.json(
              Response(constants.statusCode.ok, constants.messages.noRecordFound,[])
            )
       }
    })