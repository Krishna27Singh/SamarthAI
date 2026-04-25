const ExifParser = require("exif-parser");

const parseExifDateTag = (value) => {
  if (!value) {
    return null;
  }

  // exif-parser commonly returns DateTimeOriginal-like tags as unix seconds.
  if (typeof value === "number" && Number.isFinite(value)) {
    const iso = new Date(value * 1000).toISOString();
    return Number.isNaN(Date.parse(iso)) ? null : iso;
  }

  if (typeof value === "string") {
    // Handle EXIF format like "YYYY:MM:DD HH:mm:ss"
    const normalized = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
};

const extractGpsFromExif = (buffer) => {
  try {
    const parsed = ExifParser.create(buffer).parse();
    const tags = parsed.tags || {};

    let latitude = tags.GPSLatitude;
    let longitude = tags.GPSLongitude;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return null;
    }

    if (tags.GPSLatitudeRef === "S") {
      latitude = -Math.abs(latitude);
    }

    if (tags.GPSLongitudeRef === "W") {
      longitude = -Math.abs(longitude);
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch (error) {
    return null;
  }
};

const extractDateFromExif = (buffer) => {
  try {
    const parsed = ExifParser.create(buffer).parse();
    const tags = parsed.tags || {};

    return (
      parseExifDateTag(tags.DateTimeOriginal)
      || parseExifDateTag(tags.CreateDate)
      || parseExifDateTag(tags.ModifyDate)
      || null
    );
  } catch (error) {
    return null;
  }
};

module.exports = {
  extractGpsFromExif,
  extractDateFromExif,
};
