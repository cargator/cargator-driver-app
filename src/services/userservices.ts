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
    console.log("object")
    return customAxios.get('/getAppFlowMobile');
} 

// breakpoint api
export const getBreakPointsAPI = () =>{
    return customAxios.get('/get-breaking-points-mobile');
}

//  Custom Driver Rides API's

export const createRides = (data:any) => {
    return customAxios.post('/createRide',data)
}

export const upDateRideStatus = (data:any) =>{
    console.log("upDateRideStatus called")
    return customAxios.patch("/updateRide",data)
}


//petPuja API ----------------------

export const driverLivelocationAPI = (liveLocation: any) => {
    return customAxios.post(`/update-live-location`,liveLocation)
}

export const getOrdersAPI = () => {
    return customAxios.get('/get-new-orders')
}


export const orderAcceptAPI = (order: any) => {
    return customAxios.post('/order-accept',order)
}

export const updateOrderAPI = (data: any) => {
    return customAxios.post('/order-update',data)
}

export const setDriverOffline = () => {
    return customAxios.post('/set-driver-offline')
}