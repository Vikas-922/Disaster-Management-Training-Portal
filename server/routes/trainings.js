const express = require("express");
const TrainingEvent = require("../models/TrainingEvent.js");
const auth = require("../middleware/auth.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Optional auth middleware - sets req.user if token provided
const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ||
          "your_jwt_secret_key_change_this_in_production"
      );
      req.user = decoded;
    } catch (error) {
      // Token invalid, but continue as unauthenticated
    }
  }
  next();
};

// Get all trainings (with filters)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { status, partnerId, theme, state, limit = 50, page = 1 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (partnerId) filter.partnerId = partnerId;
    if (theme) filter.theme = theme;
    if (state) filter["location.state"] = state;

    // Only approved trainings visible to public (unless authenticated as partner/admin viewing their own)
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "partner")
    ) {
      filter.status = "approved";
    }

    const skip = (page - 1) * limit;
    const trainings = await TrainingEvent.find(filter)
      .populate("partnerId", "organizationName")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await TrainingEvent.countDocuments(filter);

    res.json({
      trainings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch trainings", error: error.message });
  }
});

// Get training by ID
router.get("/:id", async (req, res) => {
  try {
    const training = await TrainingEvent.findById(req.params.id).populate(
      "partnerId",
      "organizationName contactPerson phone"
    );
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    res.json(training);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch training", error: error.message });
  }
});

// Create training (partner only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "partner") {
      return res
        .status(403)
        .json({ message: "Only partners can create trainings" });
    }

    const {
      title,
      theme,
      startDate,
      endDate,
      state,
      district,
      city,
      latitude,
      longitude,
      trainerName,
      trainerEmail,
      participantsCount,
    } = req.body;

    const training = new TrainingEvent({
      title,
      theme,
      startDate,
      endDate,
      location: {
        state,
        district,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      trainerName,
      trainerEmail,
      participantsCount: parseInt(participantsCount),
      partnerId: req.user.userId,
      status: "pending",
    });

    await training.save();

    res.status(201).json({
      message: "Training event created successfully",
      training,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create training", error: error.message });
  }
});

// Update training (partner owner or admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const training = await TrainingEvent.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      training.partnerId.toString() !== req.user.userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this training" });
    }

    const {
      title,
      theme,
      startDate,
      endDate,
      state,
      district,
      city,
      latitude,
      longitude,
      trainerName,
      trainerEmail,
      participantsCount,
    } = req.body;

    // Only update allowed fields (not status)
    if (title) training.title = title;
    if (theme) training.theme = theme;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;
    if (trainerName) training.trainerName = trainerName;
    if (trainerEmail) training.trainerEmail = trainerEmail;
    if (participantsCount)
      training.participantsCount = parseInt(participantsCount);

    // Update location
    if (state || district || city || latitude || longitude) {
      training.location = {
        state: state || training.location?.state,
        district: district || training.location?.district,
        city: city || training.location?.city,
        latitude: latitude ? parseFloat(latitude) : training.location?.latitude,
        longitude: longitude
          ? parseFloat(longitude)
          : training.location?.longitude,
      };
    }

    await training.save();

    res.json({
      message: "Training updated successfully",
      training,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update training", error: error.message });
  }
});

// Update training status (admin only)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update status" });
    }

    const { status, reason } = req.body;

    const update = { status };
    if (status === "approved") {
      update.approvedAt = new Date();
      update.approvedBy = req.user.userId;
    } else if (status === "rejected") {
      update.rejectionReason = reason;
    }

    const training = await TrainingEvent.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json({
      message: `Training ${status} successfully`,
      training,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update training status",
      error: error.message,
    });
  }
});

// Delete training (admin or partner owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const training = await TrainingEvent.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    if (
      req.user.role !== "admin" &&
      training.partnerId.toString() !== req.user.userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this training" });
    }

    await TrainingEvent.findByIdAndDelete(req.params.id);

    res.json({ message: "Training deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete training", error: error.message });
  }
});

module.exports = router;
