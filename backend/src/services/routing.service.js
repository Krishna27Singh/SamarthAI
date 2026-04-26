const { db } = require("../config/firebase");

const normalizeList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
};

const findEligibleNGOs = async (emergencyResources, locationClue) => {
  try {
    const resourceList = normalizeList(emergencyResources);
    const locationText = String(locationClue || "").trim().toLowerCase();
    const bypassLocationFilter = locationText.length === 0;

    const ngoSnapshot = await db.collection("users").where("role", "==", "ngo").get();
    const eligibleNgoIds = [];

    ngoSnapshot.forEach((doc) => {
      const ngoData = doc.data() || {};
      const specialties = normalizeList(ngoData.specialties);
      const serviceAreas = normalizeList(ngoData.serviceAreas);

      const hasResourceMatch =
        resourceList.length > 0 &&
        specialties.length > 0 &&
        resourceList.some((resource) =>
          specialties.some(
            (specialty) => resource.includes(specialty) || specialty.includes(resource),
          ),
        );

      const hasLocationMatch = bypassLocationFilter
        ? true
        : serviceAreas.some((area) => locationText.includes(area));

      if (hasResourceMatch && hasLocationMatch) {
        eligibleNgoIds.push(doc.id);
      }
    });

    return eligibleNgoIds;
  } catch (error) {
    throw new Error(`Failed to find eligible NGOs: ${error.message}`);
  }
};

module.exports = {
  findEligibleNGOs,
};