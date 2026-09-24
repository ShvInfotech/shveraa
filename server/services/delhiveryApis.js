const delhiveryURL = "https://track.delhivery.com/c/api/";

export const PincodeServiceability = async (pincode)=>{
    try{
        console.log(process.env.DELHIVERY_AUTH_TOKEN)
        const response = await fetch(`${delhiveryURL}pin-codes/json/?filter_codes=${pincode}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
            },
        });

        const data = await response.json();
        console.log(data.delivery_codes)
        return data;
    }catch(error){
        throw error
    }

}
