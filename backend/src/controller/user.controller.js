import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateSignUpFileds, validateSignInFileds, validateUpdateFileds } from "../utils/validation.js";


const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const token = await user.generateToken();
        return token;
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token");
    }
}

const cookieOptions = { httpOnly: true, secure: true };

const register = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    const zodValidation = validateSignUpFileds({ fullname, username, email, password });

    if (!zodValidation.success) {
        throw new ApiError(400, "Input validation error");
    }

    const exisitngUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (exisitngUser) {
        throw new ApiError(409, "User already exist.");
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user!");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User register succefully"));
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const zodValidation = validateSignInFileds({ username, password });

    if (!zodValidation.success) {
        throw new ApiError(400, "Input validation error");
    }

    const user = await User.findOne({ username });

    if (!user) {
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);

    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid credentails.");
    }

    const token = await generateToken(user._id);

    const loginUser = await User.findById(user._id).select("-password");

    return res
        .status(200)
        .cookie("token", token, cookieOptions)
        .json(new ApiResponse(200, { loginUser, token }, "User logged successfully"));
});

const logout = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("token", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out."));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordIsCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordIsCorrect) {
        throw new ApiError(400, "Invalid old password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed sccessfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully."));
});

const updateUserAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    const zodValidation = validateUpdateFileds({ fullname, email });

    if (!zodValidation.success) {
        throw new ApiError(400, "Input validation error");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User data updated successfully."));
});

export { register, login, logout, changeCurrentPassword, getCurrentUser, updateUserAccountDetails };