export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
