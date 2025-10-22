export const getAllVendors = async (req, res) => {
  try {
    // Example placeholder logic
    res.json({ success: true, message: "All vendors fetched (admin only)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
