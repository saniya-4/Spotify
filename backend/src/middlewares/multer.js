const multer = require('multer');

const storage=multer.diskStorage({
    filename:function(req,file,callback){
        callback(null,file.originalname);

    }
})
const upload=multer({storage,
    limits: { fileSize: 100 * 1024 * 1024 }
});
module.exports=upload;