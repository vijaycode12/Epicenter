import { AI_SERVICE_URL } from "../config/env.js";

export const analyzeImage = async(imageUrl,incidentType)=>{
    if(!AI_SERVICE_URL){
        console.warn("AI Service is not set and skipping image AI analysis");
        return {
            detectedClass:null,
            confidence:null,
            severity:null,
            mismatchFlag:false,
            rawResponse:null
        };
    }

        try{
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(),60000);

            const response = await fetch(`${AI_SERVICE_URL}/detect`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({imageUrl}),
                signal:controller.signal,
            });

            clearTimeout(timeout);

            if(!response.ok){
                throw new Error(`AI service responded with status ${response.status}`);
            }

            const result = await response.json();

            const mismatchFlag = 
            result.detectedClass &&
            incidentType &&
            result.detectedClass.toLowerCase()!==incidentType.toLowerCase();

            return {
                detectedClass:result.detectedClass||null,
                confidence:result.confidence ?? null,
                severity:result.severity || null,
                mismatchFlag:Boolean(mismatchFlag),
                rawResponse:result,
            };
        }catch(error){
            console.error("Image AI service call failed:",error.message);
            return {
                detectedClass:null,
                confidence:null,
                severity:null,
                mismatchFlag:false,
                rawResponse:null
            };
    }
}

export const analyzeText = async(description,incidentType)=>{
    if(!AI_SERVICE_URL){
        console.warn("AI service not set");
        return {
            predictedType:null,
            confidence:null,
            severity:null,
            mismatchFlag:false,
            rawResponse:null,
        };
    }

    try{
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(),60000);

            
        const response = await fetch(`${AI_SERVICE_URL}/classify-text`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({description,incidentType}),
            signal:controller.signal,
        });

        clearTimeout(timeout);

        if(!response.ok){
            throw new Error(`AI service responded with status ${response.status}`);
        }

        const result = await response.json();

        const mismatchFlag = 
        result.predictedType&&
        incidentType&&
        result.predictedType.toLowerCase()!==incidentType.toLowerCase();

        return {
            predictedType:result.predictedType||null,
            confidence:result.confidence ?? null,
            severity:result.severity||null,
            mismatchFlag:Boolean(mismatchFlag),
            source:result.source||null,
            aiConfidence:result.aiConfidence ?? null,
            citizenConfidence:result.citizenConfidence ?? null,
            rawResponse:result,
        };
    }catch(error){
        console.error("Text AI service call failed",error.message);
        return {
            predictedType:null,
            confidence:null,
            severity:null,
            mismatchFlag:false,
            rawResponse:null,
        }
    };
}

const SEVERITY_RANK = {Low:1,Medium:2,High:3,Critical:4};

export const combineSignals = (imageResult,textResult)=>{
    const overallMismatch = Boolean(imageResult?.mismatchFlag || textResult?.mismatchFlag);

    let severity = imageResult?.severity||textResult?.severity||null;
    if(imageResult?.severity && textResult?.severity){
        severity=
        SEVERITY_RANK[imageResult.severity]>=SEVERITY_RANK[textResult.severity]
        ?imageResult.severity:textResult.severity;
    }
    return {overallMismatch,severity};
}