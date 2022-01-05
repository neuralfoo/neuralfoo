from flask import Blueprint,request,Response,stream_with_context,send_file

import json
import dbops 
from loguru import logger
import traceback
import datetime 
import utils
import os
from werkzeug.utils import secure_filename
import filetype
import fs_utils
from bson.objectid import ObjectId

import image_utils

import requests


profile = Blueprint('fs', __name__)

os.makedirs("./trove/", exist_ok=True)

@profile.route("/app/fs/image/upload",methods=["POST"])
def image_upload_to_testboard():

    try:
        endpoint = "/app/fs/image/upload"
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for "+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        logger.info("Image file UPLOAD attempt: "+str(userID))

        if 'file' not in request.files:
            message = "file missing in request"
            logger.error(message)
            return utils.return_400_error(message)  
        
        file = request.files['file']

        try:
            data = dict(request.form)
            testboardID = data["testboardID"]
            groundTruth = data["groundTruth"]
        except Exception as e:
            message = "TestboardID/groundTruth not in request"
            logger.error(message+":"+str(e))
            traceback.print_exc()
            return utils.return_400_error(message)

        if len(testboardID) == 0 or type(testboardID) != str:
            message = "TestboardID not in request"
            logger.error(message+":"+str(e))
            return utils.return_400_error(message)            


        testboard_exists = dbops.check_if_exists("testboards","_id",ObjectId(testboardID))

        if not testboard_exists:
            message = "TestboardID does not exist"
            logger.error(message)
            return utils.return_400_error(message)            

        logger.info(f"Image uploading to testboardID {testboardID}")

        filepath,filename = fs_utils.get_new_filename("./trove/","")

        file.save(filepath)

        kind = filetype.guess(filepath)

        newfilepath,newfilename = fs_utils.get_new_filename("./trove/",kind.extension)

        os.system("mv "+filepath+" "+newfilepath)

        filesize,height,width,imagehash = image_utils.get_image_data(newfilepath)

        if filesize is None:
            os.remove(newfilepath)
            message = "File seems to be corrupted"
            logger.error(message)
            return utils.return_400_error(message)

        if groundTruth == "":
            groundTruth = None

        imageID = dbops.insert_image(
            filename=secure_filename(file.filename),
            testboardID=testboardID,
            imageUrl="",
            fileSize=filesize,
            imageHeight=height,
            imageWidth=width,
            imageHash=imagehash,
            imageOcr="",
            annotation=groundTruth,
            fileType=kind.mime,
            creatorID=userID)

        if imageID is None:
            os.remove(newfilepath)
            message = "File already exists"
            logger.error(message)
            return utils.return_400_error(message)

        imageUrl = fs_utils.upload_to_fs(newfilepath)
        dbops.update_image_details(imageID,"imageUrl",imageUrl)
        os.remove(newfilepath)

        body = {
            "result":"success",
        }

        logger.info("Image file UPLOAD successful: "+str(userID))

        return utils.return_200_response(body)
    
    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)



@profile.route("/app/fs/image/<imageID>/<filename>",methods=["GET"])
def get_image(imageID,filename):

    logger.info(f"image GET request {imageID}/{filename}")

    image = dbops.get_image_details(imageID)
    
    if image is None:
        logger.error(f"image GET request failed , imageID not found {imageID}/{filename}")
        return utils.return_404_error()

    db_filename = image["filename"]
    if image["filename"] != filename:
        logger.error(f"image GET request failed , filename no match sent = {imageID}/{filename} db = {db_filename}")
        return utils.return_404_error()

    req = requests.get(image["imageUrl"], stream=True)

    return send_file(req.raw, mimetype=image["fileType"])





