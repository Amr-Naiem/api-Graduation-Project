const mongoose = require("mongoose");


const Request_Description = new mongoose.Schema(
    {
    propertyInMeter: {
      type: Number,
      required: true  
    },
    request_Desc: {
      type: String,
      required: true  
    },
    property_Type: {
      type: String,
      required: true  
    },
    location: {
      type: String,
      required: true  
    },

});


const RequestSchema = new mongoose.Schema(
  {
    Request_Acceptance: {
      type: String,
      default:"waiting"
    },
    client_Name: {
        type: String,
        required: true
    },
    provider_Name: {
        type: String,
        required: true
    },
    service_Name: {
        type: String,
        required: true
    },
    Request_Description: Request_Description
  },
  { timestamps: true }
  );
  
module.exports = mongoose.model("Request", RequestSchema);
