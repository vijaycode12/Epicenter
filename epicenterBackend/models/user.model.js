import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
    },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        sparse:true,
    },
    phone:{
        type:String,
        trim:true,
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true,
    },
    avatarUrl:{
        type:String,
    },
    isGuest:{
        type:Boolean,
        default:true,
    },
    reports:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Incident',
        },
    ],
},
{timestamps:true}
);

const User = mongoose.model('User',userSchema);

export default User;