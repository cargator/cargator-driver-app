import customAxios from "./appservices";
export const type = {
    type: 'driver',
  }
export const getRideHistory = (userId: any)=>{
    return customAxios.post(`/getRideHistory/${userId}`,type)
}

export const userDetails = (id: any) =>{
    return customAxios.get(`/getDriverById/${id}`)
}
