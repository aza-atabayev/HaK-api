const Router = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const nodemailer = require('nodemailer')
const {check, validationResult} = require("express-validator")
//importing models
const User = require("../models/User")
const authMiddlware = require("../middleware/auth.middleware")


const router = new Router()

router.post("/signup",
    [
        check("email", "Email has to be example@kaist.ac.kr.").custom(value => {
            // email must be kaist.ac.kr
            return /^[0-9A-Z]+@kaist.ac.kr$/i.test(value)
        }),
        check("password", "Password must be longer than 12.").isLength({min:12})
    ] ,
    async (req, res) => {
        try {
            // track incoming requests
            console.log(req.body)

            // validating request
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Incorrect request", errors})
            }

            const {email, password} = req.body
            
            // checking user is not registered 
            const candidate = await User.findOne({email})
            if(candidate) {
                return res.status(400).json({message: `User with email ${email} already exists. Message me if it isn't you.`})
            }

            // saving user to a database
            const hashPassword = await bcrypt.hash(password, 8)
            const user = new User({email, password: hashPassword})
            await user.save()

            // sending email
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: config.get("email"),
                  pass: config.get("email-pass") 
                }
              });
              
              var mailOptions = {
                from: 'azamatatabayevnis@gmail.com',    
                to: email,
                subject: 'Verify your email on Hak',
                html: `<a href="http://localhost:3000/verification?user=${email}&hash=${hashPassword}">
                        http://localhost:3000/verification?user=${email}&hash=${hashPassword}
                      </a>`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

            return res.json({message: "User was created"})

        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    })

router.get("/verification", 
    async (req, res) => {
    try {
        email = req.query.user
        hash = req.query.hash
        
        console.log(email, hash)

        // verifying user
        candidate = await User.findOne({email})
        if (candidate.password == hash) {
          await User.findOneAndUpdate({email}, {"verified": true})
          // sending token
          const token = jwt.sign({id: candidate.id}, config.get("secretKey"), {expiresIn: "1h"})
          return res.json({
            token,
            user: {
              id: candidate.id,
              email: candidate.email,
              verified: candidate.verified
            }
          })
        
        }

        return res.status(400).json({message: "Something went wrong"})
    } catch (e) {
        console.log(e)
    }

})

router.post("/login", 
  async (req, res) => {
    try {
      console.log(req.body)
      const {email, password} = req.body
      const user = await User.findOne({email})

      if (!user) {
        return res.status(404).json({message: "User not found"})
      }
      const isPassValid = bcrypt.compareSync(password, user.password)
      if (!isPassValid) {
        return res.status(400).json({message: "Invalid password"})
      }

      const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          reputation: user.reputation,
          likedId: user.likedId,
          dislikedId: user.dislikedId,
          verified: user.verified
        }
      })
    } catch (e) {
      console.log(e)
      res.send({message: "Server error"})
    }
  }
)

router.get("/auth", authMiddlware, 
  async (req, res) => {
    try {
      const user = await User.findOne({_id: req.user.id})
      const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          reputation: user.reputation,
          likedId: user.likedId,
          dislikedId: user.dislikedId,
          verified: user.verified
        }
      })
    } catch (e) {
      console.log(e)
      res.send({message: "Server error"})
    }
  }  
)

module.exports = router