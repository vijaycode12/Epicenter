import Incident from "../models/incident.model.js";

export const isValidCoordinate = (lat, lng) => {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  return (
    !Number.isNaN(latNum) &&
    !Number.isNaN(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
};

export const distanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const reverseGeocode = async(lat,lng)=>{
  if(!isValidCoordinate(lat,lng)){
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;

  try{
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),8000);

    const response = await fetch(url,{
      headers:{
        "User-Agent":"EpicenterDisasterVerificationApp/1.0 (student-project)",
      },
      signal:controller.signal,
    });

    clearTimeout(timeout);

    if(!response.ok){
      return null;
    }

    const data = await response.json();
    const address = data.address || {};

    const placeName = 
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.town ||
      address.city ||
      address.country ||
      null;

      return placeName;
  }catch(error){
    return null;
  }
};

export const findNearbyDuplicate = async(incidentType,latitude,longitude,radiusKm=0.5,createdWithinMinutes=60)=>{
  if(!latitude || !longitude) return null;

  const cutoff = new Date(Date.now()-createdWithinMinutes * 60*1000);

  const candidates = await Incident.find({
    incidentType,
    status:{$nin:["Rejected","Resolved"]},
    createdAt:{$gte:cutoff},
    "location.latitude":{$exists:true},
    "location.longitude":{$exists:true},
  });

  for(const candidate of candidates){
    const dist = distanceKm(latitude,longitude,candidate.location.latitude,candidate.location.longitude);
    if(dist<=radiusKm){
      return candidate;
    }
  }
  return null;
}