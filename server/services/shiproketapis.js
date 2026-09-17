import axios from"axios";

export const getshippingcharg = async (data) => {
    const pickupPincode = process.env.PICKUP_PINCODE;
 let dataparams = {
            pickup_postcode: pickupPincode,
            delivery_postcode: data.pincode,
            weight: Number(data.weight),
            cod: Number(data.cod),
            length: Number(data.length),
            breadth: Number(data.breadth),
            height: Number(data.height)
        }




    const url = "https://apiv2.shiprocket.in/v1/external/courier/serviceability";

    const response = await axios.get(url, {
        params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: data.pincode,
            weight: Number(data.weight),
            cod: Number(data.cod),
            length: Number(data.length),
            breadth: Number(data.breadth),
            height: Number(data.height)
        },
        headers: {
            Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`
        }
    });
   
    return response.data;
}


export const getReturnshippingcharg = async (orderId) => {
    const deliveryPincode = process.env.PICKUP_PINCODE;



    const url = "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";

    const response = await axios.get(url, {
        params: {
            order_id: orderId,
           
        },
        headers: {
            Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`
        }
    });
    return response.data;

}


export const CreatOrderINShiproket = async (data) => {
    const url = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc";

    const response = await axios.post(
        url,
        data,
        {
            headers: {
                Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
}


export const AssignCourierAndAWB = async(data)=>{
   const url = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb";

    const response = await axios.post(
        url,
        data,
        {
            headers: {
                Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
}



export const GenerateLabel = async(data)=>{
    const url = "https://apiv2.shiprocket.in/v1/external/courier/generate/label";
    const response = await axios.post(
        url,
        {shipment_id:data},
        {
            headers: {
                Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
}



export const ShiprocketCancel = async(id)=>{
    console.log(id)
    const url = "https://apiv2.shiprocket.in/v1/external/orders/cancel";
    const response = await axios.post(
        url,
        {ids:[id]},
        {
            headers: {
                Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
}



export const ShiproketReturnCreate = async(data) =>{
     const url = "https://apiv2.shiprocket.in/v1/external/orders/create/return";

    const response = await axios.post(
        url,
        data,
        {
            headers: {
                Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );

    
    return response.data;
}