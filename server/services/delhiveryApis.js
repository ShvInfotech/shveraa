const delhiveryURL = "https://staging-express.delhivery.com/";

export const PincodeServiceability = async (pincode) => {
  try {

    const response = await fetch(`${delhiveryURL}c/api/pin-codes/json/?filter_codes=${pincode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
    });

    const data = await response.json();

    return data;
  } catch (error) {
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
        Authorization: `Token c4a879ebfaca226e04835194373408ffcb5d3e49`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("CheckShippingChargesService Error:", error);
    throw error;
  }
};


export const CreateShippingOrderService = async (shippingData) => {
  try {
    const formData = new URLSearchParams();

    formData.append("format", "json");
    formData.append("data", JSON.stringify(shippingData));

    const response = await fetch(`${delhiveryURL}api/cmu/create.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
      body: formData.toString(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("CreateShippingOrderService Error:", error);
    throw error;
  }
};


export const TrackShipmentService = async (waybill) => {
  try {

    const response = await fetch(`${delhiveryURL}api/v1/packages/json/?waybill=${waybill}&ref_ids=`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
    });


    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Track Order Error:", error);
    throw error;
  }
}




export const CancelShipmentService = async (waybill) => {
  try {

    const response = await fetch(`${delhiveryURL}api/p/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        "waybill": waybill,
        "cancellation": "true"
      })
    });


    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Track Order Error:", error);
    throw error;
  }
}



export const LabelGenerationService = async (waybills) => {
  try {
    const wbns = waybills.join(",");

    const response = await fetch(`${delhiveryURL}api/p/packing_slip?wbns=${wbns}&pdf=true&pdf_size=`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      }
    });


    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Track Order Error:", error);
    throw error;
  }
}


export const PickupGenerationService = async (time,date,count) => {
  try {
    const response = await fetch(`${delhiveryURL}fm/request/new/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        pickup_time: time,
        pickup_date: date,
        pickup_location: process.env.DELHIVERY_PICKUP_LOCATION,
        expected_package_count: count
      })
    });


    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Track Order Error:", error);
    throw error;
  }
}






