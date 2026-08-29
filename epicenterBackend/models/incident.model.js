import mongoose from "mongoose";
import { INCIDENT_TYPES, INCIDENT_STATUS, SEVERITY_LEVELS } from "../utils/constants.js";

const incidentSchema = new mongoose.Schema({

    reportedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null,
    },
    phone:[{
        type:String,
        trim:true,
    }],
    email:[{
        type:String,
        triem:true,
        lowercase:true,
    }],
    duplicateReportCount:{
        type:Number,
        default:0,
    },
    //Submitted form
    incidentType:{
        type:String,
        enum:INCIDENT_TYPES,
        required:[true,"Incident type is required"],
    },
    description:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    imageUrl:{
        type:String,
        required:[true,"Incident image is required"],
    },
    imagePublicId:{
        type:String,
    },
    location:{
        latitude:{
            type:Number,
        },
        longitude:{
            type:Number,
        },
        placeName:{
            type:String,
            trim:true,
        },
        manualAddress:{
            type:String,
            trim:true,
        },
    },

    //AI Verification
    ai:{
        //YOLOV8 AI for image classification
        image:{
            detectedClass:{type:String},
            confidence:{type:Number,min:0,max:1},
            severity:{type:String,enum:SEVERITY_LEVELS},
            mismatchFlag:{
                type:Boolean,default:false
            },
            rawResponse:{
                type:mongoose.Schema.Types.Mixed
            },
        },
        //DISITLBERT for text classificarion
        text:{
            predictedType:{type:String},
            confidence:{type:Number , min:0,max:1},
            severity:{type:String,enum:SEVERITY_LEVELS},
            mismatchFlag:{type:Boolean,default:false},
            rawResponse:{type:mongoose.Schema.Types.Mixed},
            source:{type:String,enum:["ai","citizen"]},
            aiConfidence:{type:Number,min:0,max:1},
            citizenConfidence:{type:Number,min:0,max:1},
            aiRan:{type:Boolean},
        },

        //combined results for both image and text
        overallMismatch:{type:Boolean,default:false},
        severity:{type:String,enum:SEVERITY_LEVELS},
    },

    //Verification status
    status:{
        type:String,
        enum:INCIDENT_STATUS,
        default:"Pending",
    },
    verifiedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'verificationOfficer',
        default:null,
    },
    rejectionReason:{
        type:String,
        trim:true,
    },
    assignedTeam:{
        type:String,
        trim:true,
    },
},{timestamps:true});

incidentSchema.index({status:1,createdAt:-1});

const Incident = mongoose.model('Incident',incidentSchema);

export default Incident;