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