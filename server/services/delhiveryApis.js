const getDelhiveryURL = () => {
  if (process.env.DELHIVERY_URL) {
    let url = process.env.DELHIVERY_URL.trim();
    if (!url.endsWith('/')) url += '/';
    return url;
  }
  if (process.env.DELHIVERY_ENV === 'staging') {
    return 'https://staging-express.delhivery.com/';
  }
  return 'https://track.delhivery.com/';
};

export const PincodeServiceability = async (pincode) => {
  try {
    if (!process.env.DELHIVERY_AUTH_TOKEN) {
      console.warn("DELHIVERY_AUTH_TOKEN is not configured in environment");
      return { delivery_codes: [{ postal_code: { pin: pincode } }] };
    }

    const baseUrl = getDelhiveryURL();
    const response = await fetch(`${baseUrl}c/api/pin-codes/json/?filter_codes=${pincode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Delhivery API returned status ${response.status}: ${errText.slice(0, 150)}`);
      return { delivery_codes: [{ postal_code: { pin: pincode } }] };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("PincodeServiceability error, allowing fallback:", error.message);
    return { delivery_codes: [{ postal_code: { pin: pincode } }] };
  }
};


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
    const baseUrl = getDelhiveryURL();

    const url = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?${params.toString()}`;
    
    const token = process.env.DELHIVERY_AUTH_TOKEN;
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
    if (!process.env.DELHIVERY_AUTH_TOKEN) {
      console.warn("[Delhivery] DELHIVERY_AUTH_TOKEN is not set in environment. Skipping auto shipment.");
      return { success: false, rmk: "DELHIVERY_AUTH_TOKEN is not set in environment" };
    }

    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(shippingData));

    let baseUrl = getDelhiveryURL();

    let response = await fetch(`${baseUrl}api/cmu/create.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
      },
      body: formData.toString(),
    });

    // Fallback between track.delhivery.com and staging-express.delhivery.com if 401 occurs
    if (response.status === 401 && !process.env.DELHIVERY_URL && !process.env.DELHIVERY_ENV) {
      const altUrl = baseUrl.includes("track.delhivery.com")
        ? "https://staging-express.delhivery.com/"
        : "https://track.delhivery.com/";
      console.warn(`[Delhivery] Status 401 with primary URL. Retrying with fallback URL: ${altUrl}`);
      response = await fetch(`${altUrl}api/cmu/create.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Token ${process.env.DELHIVERY_AUTH_TOKEN}`,
        },
        body: formData.toString(),
      });
    }

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[Delhivery] Non-JSON API response:", rawText.slice(0, 300));
      return { success: false, rmk: rawText.slice(0, 300) };
    }

    return data;
  } catch (error) {
    console.error("CreateShippingOrderService Error:", error.message);
    return { success: false, error: error.message };
  }
};


export const TrackShipmentService = async (waybill) => {
  try {

    const response = await fetch(`${getDelhiveryURL()}api/v1/packages/json/?waybill=${waybill}&ref_ids=`, {
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

    const response = await fetch(`${getDelhiveryURL()}api/p/edit`, {
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
    const response = await fetch(`${getDelhiveryURL()}api/p/packing_slip?wbns=${wbns}&pdf=true&pdf_size=`, {
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
    const response = await fetch(`${getDelhiveryURL()}fm/request/new/`, {
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






