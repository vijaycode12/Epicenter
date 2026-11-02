import mongoose from "mongoose";
import dns from "dns";
import { DB_URL } from "../config/env.js"; // importing this also loads the .env file
import verificationOfficer from "../models/verification.model.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Officers are read from environment variables so no credentials live in git.
// For each officer N (1, 2, 3, ...) set:
//   SEED_OFFICER_N_ID, SEED_OFFICER_N_NAME, SEED_OFFICER_N_EMAIL, SEED_OFFICER_N_PASSWORD
const loadOfficers = () => {
    const officers = [];
    for (let i = 1; process.env[`SEED_OFFICER_${i}_ID`]; i++) {
        const p = `SEED_OFFICER_${i}_`;
        const officer = {
            employeeId: process.env[`${p}ID`],
            name: process.env[`${p}NAME`],
            email: process.env[`${p}EMAIL`],
            password: process.env[`${p}PASSWORD`],
        };
        const missing = Object.entries(officer).filter(([, v]) => !v).map(([k]) => k);
        if (missing.length) {
            throw new Error(`Officer ${i} is missing: ${missing.join(", ")}`);
        }
        officers.push(officer);
    }
    return officers;
};

const seed = async () => {
    let failed = false;
    try {
        if (!DB_URL) {
            throw new Error("DB_URL is not set");
        }

        const OFFICERS = loadOfficers();
        if (OFFICERS.length === 0) {
            throw new Error("No officers found. Set SEED_OFFICER_1_ID, _NAME, _EMAIL, _PASSWORD in your .env file");
        }

        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB for seeding");

        for (const officerData of OFFICERS) {
            const exists = await verificationOfficer.findOne({
                $or: [{ employeeId: officerData.employeeId }, { email: officerData.email }],
            });

            if (exists) {
                console.log(`Skipped ${officerData.employeeId} - already exists`);
                continue;
            }

            await verificationOfficer.create(officerData);
            console.log(`Created officer: ${officerData.employeeId} (${officerData.name})`);
        }

        console.log("Seeding complete");
    } catch (error) {
        failed = true;
        console.log("Seeding failed:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(failed ? 1 : 0);
    }
};

seed();
