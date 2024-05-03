import customAxios from "./appservices";


export const login = (data: { mobileNumber: any; type: string; }) =>{
    return customAxios.post('/login', data);
}

export const verifyOtp = (data: { otp: any; type: string; mobileNumber: any; }) =>{
    return customAxios.post('/verifyOtp',data );
}

export const getPreSignedUrl = (data: { key: any; ContentType: string; type: string; }) =>{
    return customAxios.post('/presignedurl',data)
}

export const getcountryCodeAPI = () =>{
    return customAxios.get('/getCountryCodeMobile');
} 


export const getDriverAppFlowAPI = () =>{
    return customAxios.get('/getAppFlowMobile');
} 

//  Custom Driver Rides API's

export const createRides = (data:any) => {
    return customAxios.post('/createRide',data)
}

export const upDateRideStatus = (data:any) =>{
    console.log("upDateRideStatus called")
    return customAxios.patch("/updateRide",data)
}