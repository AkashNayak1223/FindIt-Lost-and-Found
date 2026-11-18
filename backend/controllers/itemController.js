
import { db } from "../config/firebase.js";

// Get all items
export const getAllItems = async (req, res) => {
  try {
    const snapshot = await db.collection("items")
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const doc = await db.collection("items")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create item
export const createItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      location,
      status,
      description,
      imageUrl,
    } = req.body;

    const userId = req.user.uid;

    if (
      typeof itemName !== "string" || !itemName.trim() ||
      typeof category !== "string" || !category.trim() ||
      typeof location !== "string" || !location.trim() ||
      typeof status !== "string" || !status.trim() ||
      typeof description !== "string" || !description.trim()
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    if (!["Lost", "Found"].includes(status.trim())) {
      return res.status(400).json({
        message: "Status must be Lost or Found",
      });
    }

    if (
      imageUrl !== undefined &&
      typeof imageUrl !== "string"
    ) {
      return res.status(400).json({
        message: "imageUrl must be a string",
      });
    }

    const newItem = {
      itemName: itemName.trim(),
      category: category.trim(),
      location: location.trim(),
      status: status.trim(),
      description: description.trim(),
      imageUrl: imageUrl || "",
      userId,
      createdAt: new Date(),
    };

    const docRef = await db.collection("items").add(newItem);

    res.status(201).json({
      message: "Item created successfully",
      id: docRef.id,
      ...newItem,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const doc = db.collection("items").doc(req.params.id);
    const snapshot = await doc.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (snapshot.data().userId !== req.user.uid) {
      return res.status(403).json({
        message: "You cannot update this item",
      });
    }

    const allowedFields = [
      "itemName",
      "category",
      "location",
      "status",
      "description",
      "imageUrl",
    ];

    const updates = {};

    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          message: `Cannot update ${field}`,
        });
      }

      const value = req.body[field];

      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          message: `${field} must be a non-empty string`,
        });
      }

      updates[field] = value.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    if (
      updates.status &&
      !["Lost", "Found"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Status must be Lost or Found",
      });
    }

    await doc.update(updates);

    res.status(200).json({
      message: "Item updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const doc = db.collection("items").doc(req.params.id);
    const snapshot = await doc.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (snapshot.data().userId !== req.user.uid) {
      return res.status(403).json({
        message: "You cannot delete this item",
      });
    }

    await doc.delete();

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
