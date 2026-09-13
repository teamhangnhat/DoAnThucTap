const express = require("express");

const multer = require("multer");

const path = require("path");

const fs = require("fs");


const router = express.Router();


const uploadDir = path.join(

    __dirname,

    "../uploads/sale"

);


if (

    !fs.existsSync(uploadDir)

) {

    fs.mkdirSync(

        uploadDir,

        {

            recursive: true

        }

    );

}


const storage = multer.diskStorage({

    destination: (

        req,

        file,

        cb

    ) => {

        cb(

            null,

            uploadDir

        );

    },


    filename: (

        req,

        file,

        cb

    ) => {

        const uniqueName =

            Date.now() +

            "-" +

            file.originalname

                .replace(

                    /\s+/g,

                    "-"

                );


        cb(

            null,

            uniqueName

        );

    }

});


const upload = multer({

    storage

});


router.post(

    "/sale",

    upload.single("image"),

    (req, res) => {

        if (

            !req.file

        ) {

            return res.status(400).json({

                message:

                    "No image uploaded"

            });

        }


        res.json({

            image_url:

                `uploads/sale/${req.file.filename}`

        });

    }

);


module.exports = router;