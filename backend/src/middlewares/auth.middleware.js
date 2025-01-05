import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            throw new ApiError(401, "Unauthorize request");
        }

        const decodeToken = jwt.verify(token, config.tokenSecret);

        const user = await User.findById(decodeToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token.");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token.");
    }
});

export { verifyJwt };