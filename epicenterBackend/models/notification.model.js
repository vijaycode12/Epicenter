import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../utils/constants.js";

const notificationSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null,
    },
    phone:[{
        type:String,
        trim:true,
    }],
    incident:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Incident',
        required:true,
    },
    type:{
        type:String,
        enum:NOTIFICATION_TYPES,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    isRead:{
        type:Boolean,
        default:false,
    },
},{timestamps:true});

const Notification = mongoose.model("Notification",notificationSchema);

export default Notification;