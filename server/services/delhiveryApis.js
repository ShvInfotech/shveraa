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
      
        return data;
    }catch(error){
        throw error
    }

}


export const CheckShippingChargesService = async (delhiveryData) => {
  try {
    const params = new URLSearchParams({
      md: String(delhiveryData.md),
      ss: String(delhiveryData.ss),
      d_pin: String(delhiveryData.d_pin),
      o_pin: String(delhiveryData.o_pin),
      cgm: Number(delhiveryData.cgm),
      pt: String(delhiveryData.pt),
      cod: Number(delhiveryData.cod),
    });
    const url = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
    });

   const data = await response.json();
    return data;
  } catch (error) {
    console.error("CheckShippingChargesService Error:", error);
    throw error;
  }
};
