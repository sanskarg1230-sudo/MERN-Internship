const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student', // default role
    });

    if (user) {
      generateToken(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        bio: user.bio,
        skills: user.skills,
        location: user.location,
        jobTitle: user.jobTitle,
        socialLinks: user.socialLinks,
        enrolledCourses: user.enrolledCourses,
        passedQuizzes: user.passedQuizzes,
        completedCourses: user.completedCourses,
        completedLessons: user.completedLessons,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
    
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          bio: user.bio,
          skills: user.skills,
          location: user.location,
          jobTitle: user.jobTitle,
          socialLinks: user.socialLinks,
          enrolledCourses: user.enrolledCourses,
          passedQuizzes: user.passedQuizzes,
          completedCourses: user.completedCourses,
          completedLessons: user.completedLessons,
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refresh_jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const refreshToken = async (req, res) => {
    const rfToken = req.cookies.refresh_jwt;
    if (!rfToken) {
        return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    try {
        const decoded = jwt.verify(rfToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
             return res.status(401).json({ message: 'User not found' });
        }

        // Generate new tokens
        generateToken(res, user._id);

        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, refresh token failed' });
    }
}

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        bio: user.bio,
        skills: user.skills,
        location: user.location,
        jobTitle: user.jobTitle,
        socialLinks: user.socialLinks,
        enrolledCourses: user.enrolledCourses,
        passedQuizzes: user.passedQuizzes,
        completedCourses: user.completedCourses,
        completedLessons: user.completedLessons,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    user.location = req.body.location !== undefined ? req.body.location : user.location;
    user.jobTitle = req.body.jobTitle !== undefined ? req.body.jobTitle : user.jobTitle;
    
    if (req.body.skills) {
      // If skills comes as comma separated string
      if (typeof req.body.skills === 'string') {
        user.skills = req.body.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      } else if (Array.isArray(req.body.skills)) {
        user.skills = req.body.skills;
      }
    }

    if (req.body.socialLinks) {
      user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
    }

    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isEmailVerified: updatedUser.isEmailVerified,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      location: updatedUser.location,
      jobTitle: updatedUser.jobTitle,
      socialLinks: updatedUser.socialLinks,
      enrolledCourses: updatedUser.enrolledCourses,
      passedQuizzes: updatedUser.passedQuizzes,
      completedCourses: updatedUser.completedCourses,
      completedLessons: updatedUser.completedLessons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getMe,
  updateProfile,
};
