import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const verificationSchema = new mongoose.Schema({
    employeeId:{
        type:String,
        required:[true,"Employee ID is required"],
        unique:true,
        trim:true,
    },
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:6,
        select:false,
    },
    isActive:{
        type:Boolean,
        default:true,
    },
},{timestamps:true});


verificationSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

verificationSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const verificationOfficer = mongoose.model("verificationOfficer",verificationSchema);

export default verificationOfficer;