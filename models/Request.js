const mongoose = require("mongoose");


const Request_Description = new mongoose.Schema(
    {
    propertyInMeter: {
      type: Number,
      required: true  
    },
    request_Desc: {
      type: Object,
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
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
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
