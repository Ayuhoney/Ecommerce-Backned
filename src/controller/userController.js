const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authSchema } = require("../validators/schemaValidation");
const randomstring = require("randomstring");
const { sendResetPasswordMail } = require("../validators/sendMail");


//SignUP
const signUp = async (req, res) => {
  try {
    const { email, password, name, mobile, role } = req.body;

    // Check for valid request
    if ( !email || !password || !name || !mobile || !role ||  Object.keys(req.body).length !== 5 ){
      return res.status(400).send({ status: false, message: "Invalid request" });
    }

    const valid = authSchema.validate(req.body);

    if (valid.error) {
      return res.status(400).send(valid.error.details[0].message);
    }

    // Check if email already exists
    let checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(409).send({ status: false, message: "Email already exists" });
    }

    let hash = await bcrypt.hash(password, 10);

    const user = {
      email: email,
      password: hash,
      name,
      mobile,
      role 
    };

    let savedData = await userModel.create({...user,
      tokens: [{ token: jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }) }]
    });

    // Create and send JWT token
    let token = savedData.tokens[0].token;

    return res.cookie("x-api-key", token).status(201).send({
      status: true,
      message: "Signup successful",
      token: token,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};



///login user
let UserIdToLocal
const getUserId = ( ) => {
  return UserIdToLocal
}
const loginUser = async function (req, res) {

  try {
    const email = req.body.email;
    const Password = req.body.password;

    if (Object.keys(req.body).length == 0 || Object.keys(req.body).length > 2) {
      return res.status(400).send({ status: false, message: "invalid request" });
    }

    if (!email) {
      return res.status(400).send({ message: "email is not present" });
    }
    if (!Password) {
      return res.status(400).send({ message: "Password is not present" });
    }
    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(409)
        .send({ status: false, message: "email or Password are not correct" });
    }
    let hashPassword = await bcrypt.compare(Password, user.password);
    if (!hashPassword) {
      return res
        .status(409)
        .send({ message: "email or Password are not corerct" });
    }
    let token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    let refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REF_TOKEN_SECRET,
      { expiresIn: process.env.REF_TOKEN_EXPIRE }
    );
    const response = {
      status: "Logged in",
      token: token,
      refreshToken: refreshToken,
    };
    let oldTokens = user.tokens || [];
    if (oldTokens.length) {
      oldTokens = oldTokens.filter((t) => {
        if (t.signedAt < Date.now()) {
          return t;
        }
      });
    }
    await userModel.findByIdAndUpdate(user._id, {
      tokens: [
        ...oldTokens,
        { token, signedAt: new Date(Date.now() + 5 * 60 * 1000) },  //0 min 5 sec
      ],
    });
    const userInfo = {
      email: user.email,
    };
    UserIdToLocal=user._id
    res
      .status(200)
      .send({ success: true, user: userInfo, message:" login successfully" ,response, token: token });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//refreshToken
const refreshToken = (req, res) => {
  try {
    const postData = req.body;
    if (postData.refreshToken) {
      let decodedToken = jwt.verify(
        postData.refreshToken,
        process.env.REF_TOKEN_SECRET
      );
      const token = jwt.sign(
        { userId: decodedToken.userId },
        process.env.JWT_SECRET,
        { expiresIn: "50m" }
      );
      const response = {
        token: token,
      };
      res.status(200).json(response);
    } else {
      res.status(404).send({message:"Invalid request"});
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// send mail to forget  password
const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({ email });
    if (!userData) {
      return res
        .status(404)
        .send({ success: false, message: "email not found" });
    }
    if (userData) {
      const randomString = randomstring.generate();

       await userModel.findOneAndUpdate(
        { email: email },
        {
          $set: {
            token: randomString,
            tokenExp: Math.round(new Date(Date.now() + 5 * 60 * 1000)),
          },
          new: true,
        }
      );
      sendResetPasswordMail(userData.email, randomString);

      res
        .status(200)
        .send({
          success: true,
          message: "please check your inbox of mail and reset your password ",
        });
    } else {
      res
        .status(400)
        .send({ success: false, message: "this mail does not exits" });
    }
  } catch (error) {
    res.status(400).send({ success: false, error: error.message });
  }
};

//update new password
const updatePassword = async (req, res) => {
  try {
    const token = req.params.emailToken;
    const tokenData = await userModel.findOne({ token: token });
    if (!tokenData) {
      return res
        .status(400)
        .send({ success: false, message: "token expired or empty" });
    }
    if (tokenData.tokenExp < Date.now()) {
      return res
        .status(400)
        .send({ success: false, message: "this link has been expired ! Please try again" });
    }
    if (tokenData) {
      const password = req.body.newPassword;
      const newPassword = await bcrypt.hash(password, 10);
      const userData = await userModel.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      return res
        .status(200)
        .send({
          success: true,
          message: "User password has been reset"
        });
    } else {
      res.status(400).send({ success: false, message: "invalid token " });
    }
  } catch (error) {
    return res.status(400).send({ success: false, error: error.message });
  }
};

///logout 
const logout = async (req, res) => {
  let userId = req.user.userId; //email id is used for logout
  try {
    let token = req.headers["x-api-key"];
    const tokens = req.user.tokens;

    let user = await userModel.findById(userId);
    const newTokens = user.tokens.filter((t) => t.token !== token);

    await userModel.findByIdAndUpdate(
      userId,
      { tokens: newTokens },
      { new: true }
    );

    return res
      .status(200)
      .send({ success: true, message: "Sign out successfully!" });
  } catch (error) {
    return res.status(500).send({ success: false, error: error.message });
  }
};

module.exports = {
  getUserId,
  signUp,
  loginUser,
  updatePassword,
  forgetPassword,
  logout,
  refreshToken,
};
