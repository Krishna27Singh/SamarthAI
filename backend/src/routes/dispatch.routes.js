const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  recommendVolunteers,
  assignVolunteer,
  acceptEmergency,
  completeEmergency,
} = require("../controllers/dispatch.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/recommend", recommendVolunteers);
router.post("/assign", assignVolunteer);
router.post("/accept", acceptEmergency);
router.post("/complete", completeEmergency);

module.exports = router;
