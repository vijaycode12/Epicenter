import mongoose from "mongoose";
import dns from 'dns';
import { DB_URL } from "../config/env.js";
import verificationOfficer from "../models/verification.model.js";
import { Db } from "mongodb";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const OFFICERS = [
    {
        employeeId: "VRF-1001",
        name: "Ananya Rao",
        email: "ananya.rao@epicenter.gov.in",
        password: "Verify@1001",
    },
    {
        employeeId: "VRF-1002",
        name: "Karthik Reddy",
        email: "karthik.reddy@epicenter.gov.in",
        password: "Verify@1002",
    },
    {
        employeeId: "VRF-1003",
        name: "Sneha Iyer",
        email: "sneha.iyer@epicenter.gov.in",
        password: "Verify@1003",
    },
];

const seed = async()=>{
    try{
        if(!DB_URL){
            throw new Error("Database is not connected");
        }

        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB for seeding");

        for(const officerData of OFFICERS){
            const exists = await verificationOfficer.findOne({
                $or:[{employeeId:officerData.employeeId},{email:officerData.email}],
            });

            if(exists){
                console.log(`Skipped ${officerData.employeeId}-already exists`);
                continue;
            }

            await verificationOfficer.create(officerData);
            console.log(`Created officer : ${officerData.employeeId} (${officerData.name})`);
        }

        console.log("Sending complete");
    }catch(error){
        console.log("Seeding failed:",error.message);
    }finally{
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed();