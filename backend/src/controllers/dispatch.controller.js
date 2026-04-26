const axios = require("axios");
const { admin, db } = require("../config/firebase");

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
const EMERGENCY_SOURCES = ["manual_logs", "video_reports", "voice_reports", "scene_assessments"];

const recommendVolunteers = async (req, res) => {
  try {
    const { emergencyId, description, urgency } = req.body;
    const ngoId = req.user?.uid;

    if (!emergencyId || !description || !urgency) {
      return res.status(400).json({
        message: "emergencyId, description, and urgency are required.",
      });
    }

    // Try to fetch AI recommendations
    try {
      const aiResponse = await axios.post(`${FASTAPI_BASE_URL}/api/emergency/match`, {
        emergency_description: description,
        urgency_level: urgency,
        ngoId: ngoId,
      });

      return res.status(200).json({
        emergencyId,
        volunteers: aiResponse.data?.volunteers || [],
        count: aiResponse.data?.count || 0,
        isFallback: false,
      });
    } catch (mlServiceError) {
      // ML Service failed or unreachable, trigger fallback
      console.warn(`[WARN] ML Service unavailable: ${mlServiceError.message}. Triggering fallback mechanism.`);

      // Fallback: Query Firestore for all volunteers belonging to this NGO
      console.log("Fallback searching in 'users' for ngoId:", req.user.uid);
      const snapshot = await db
        .collection("users")
        .where("role", "==", "volunteer")
        .where("ngoId", "==", req.user.uid)
        .limit(20)
        .get();
      console.log("Fallback volunteers found:", snapshot.size);

      const fallbackVolunteers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fallbackVolunteers.push({
          volunteerId: doc.id,
          name: data.name || data.displayName || data.email || "Unnamed Volunteer",
          skillsBio: data.skillsBio || "",
          clusterLabel: data.clusterLabel || "Unknown",
          locationZone: data.locationZone || "",
          phone: data.phone || "",
        });
      });

      return res.status(200).json({
        emergencyId,
        volunteers: fallbackVolunteers,
        count: fallbackVolunteers.length,
        isFallback: true,
        message: "Using fallback volunteer list due to ML service unavailability.",
      });
    }
  } catch (error) {
    console.error(`[ERROR] Recommend volunteers failed: ${error.message}`);
    return res.status(500).json({
      message: "Failed to fetch AI volunteer recommendations.",
      error: error.message,
    });
  }
};

const assignVolunteer = async (req, res) => {
  try {
    const { emergencyId, volunteerId, description, sourceCollection } = req.body;
    const emergencyCollection = EMERGENCY_SOURCES.includes(sourceCollection) ? sourceCollection : "manual_logs";

    if (!emergencyId || !volunteerId) {
      return res.status(400).json({
        message: "emergencyId and volunteerId are required.",
      });
    }

    const emergencyRef = db.collection(emergencyCollection).doc(emergencyId);
    const volunteerRef = db.collection("users").doc(volunteerId);

    const [emergencyDoc, volunteerDoc] = await Promise.all([
      emergencyRef.get(),
      volunteerRef.get(),
    ]);

    if (!emergencyDoc.exists) {
      return res.status(404).json({ message: "Emergency not found." });
    }

    if (!volunteerDoc.exists) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    const emergencyData = emergencyDoc.data() || {};
    const volunteerData = volunteerDoc.data() || {};
    const notificationBody =
      description ||
      emergencyData.description ||
      emergencyData.emergency_description ||
      "A new emergency task has been assigned to you.";

    await Promise.all([
      emergencyRef.update({
        status: "assigned",
        assignedVolunteerId: volunteerId,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      volunteerRef.update({
        tasksAssigned: admin.firestore.FieldValue.increment(1),
      }),
    ]);

    let notificationStatus = "not_sent";
    let notificationError = null;

    const fcmToken = volunteerData.fcmToken;
    if (fcmToken) {
      try {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "Urgent Task Assigned",
            body: notificationBody,
          },
          data: {
            emergencyId,
            volunteerId,
          },
        });
        notificationStatus = "sent";
      } catch (sendError) {
        notificationStatus = "failed";
        notificationError = sendError.message;
      }
    } else {
      notificationStatus = "missing_token";
    }

    return res.status(200).json({
      message: "Volunteer assigned successfully.",
      emergencyId,
      sourceCollection: emergencyCollection,
      volunteerId,
      notificationStatus,
      ...(notificationError ? { notificationError } : {}),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to assign volunteer.",
      error: error.message,
    });
  }
};

const acceptEmergency = async (req, res) => {
  try {
    const { emergencyId, volunteerId, sourceCollection } = req.body;
    const emergencyCollection = EMERGENCY_SOURCES.includes(sourceCollection) ? sourceCollection : "manual_logs";

    if (!emergencyId || !volunteerId) {
      return res.status(400).json({
        message: "emergencyId and volunteerId are required.",
      });
    }

    const emergencyRef = db.collection(emergencyCollection).doc(emergencyId);
    const volunteerRef = db.collection("users").doc(volunteerId);

    const [emergencyDoc, volunteerDoc] = await Promise.all([
      emergencyRef.get(),
      volunteerRef.get(),
    ]);

    if (!emergencyDoc.exists) {
      return res.status(404).json({ message: "Emergency not found." });
    }

    if (!volunteerDoc.exists) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    const emergencyData = emergencyDoc.data() || {};
    const assignedAtRaw = emergencyData.assignedAt;

    let responseTimeMinutes = 0;
    if (assignedAtRaw && typeof assignedAtRaw.toDate === "function") {
      const assignedDate = assignedAtRaw.toDate();
      const nowDate = new Date();
      responseTimeMinutes = Math.max(0, Math.round((nowDate.getTime() - assignedDate.getTime()) / 60000));
    }

    await Promise.all([
      emergencyRef.update({
        status: "in_progress",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      volunteerRef.update({
        totalResponseTimeMins: admin.firestore.FieldValue.increment(responseTimeMinutes),
      }),
    ]);

    return res.status(200).json({
      message: "Emergency accepted.",
      emergencyId,
      volunteerId,
      responseTimeMinutes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to accept emergency.",
      error: error.message,
    });
  }
};

const completeEmergency = async (req, res) => {
  try {
    const { emergencyId, volunteerId, sourceCollection } = req.body;
    const emergencyCollection = EMERGENCY_SOURCES.includes(sourceCollection) ? sourceCollection : "manual_logs";

    if (!emergencyId || !volunteerId) {
      return res.status(400).json({
        message: "emergencyId and volunteerId are required.",
      });
    }

    const emergencyRef = db.collection(emergencyCollection).doc(emergencyId);
    const volunteerRef = db.collection("users").doc(volunteerId);

    const [emergencyDoc, volunteerDoc] = await Promise.all([
      emergencyRef.get(),
      volunteerRef.get(),
    ]);

    if (!emergencyDoc.exists) {
      return res.status(404).json({ message: "Emergency not found." });
    }

    if (!volunteerDoc.exists) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    await Promise.all([
      emergencyRef.update({
        status: "completed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      volunteerRef.update({
        tasksCompleted: admin.firestore.FieldValue.increment(1),
      }),
    ]);

    return res.status(200).json({
      message: "Emergency marked as completed.",
      emergencyId,
      volunteerId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to complete emergency.",
      error: error.message,
    });
  }
};

module.exports = {
  recommendVolunteers,
  assignVolunteer,
  acceptEmergency,
  completeEmergency,
};
