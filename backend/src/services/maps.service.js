const axios = require("axios");

const geocodeAddress = async (address) => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }

  const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY,
      region: "in",
    },
  });

  const { status, results, error_message } = response.data;
  if (status !== "OK" || !Array.isArray(results) || results.length === 0) {
    console.error("Geocoding Failed");
    console.error("Status:", status);
    console.error("Google Error:", error_message);
    console.error("Location string searched:", address);
    throw new Error("Geocoding API failed with status: " + status);
  }

  const location = results[0].geometry.location;
  return {
    latitude: location.lat,
    longitude: location.lng,
    formattedAddress: results[0].formatted_address,
  };
};

module.exports = {
  geocodeAddress,
};
