import multer, { diskStorage } from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export default multer({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      cb(null, join(__dirname, '../public/mp3'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.mp3');
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.mp3$/)) {
      return cb(new Error('Please upload an mp3 file.'));
    }
    cb(null, true);
  },
}).single("mp3");


/**
 * export default multer({
  storage: diskStorage({
    destination: (req, file, callback) => {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      callback(null, join(__dirname, ".." + process.env.IMGURL));
      //for docker
      // callback(null, "/public/images");
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname);
    },
  }),

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|JPG|PNG|JPEG)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
}).single("Image");
 */
