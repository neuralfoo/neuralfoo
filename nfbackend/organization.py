from flask import Blueprint,request

import json
import dbops 
from loguru import logger
import traceback
import datetime 
import utils

profile = Blueprint('organization', __name__)


@profile.route("/app/organization/referralCode/get",methods=["GET"])
def get_organization_referral_code():

    try:
        endpoint = "/app/organization/referralCode/get"
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for "+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        logger.info("Organization referral code GET attempt: "+str(userID))

        referralCode,orgname = dbops.get_organization_referral_code(organizationID)

        if referralCode is None:
            return utils.return_400_error("Unexpected error occurred")
        

        body = {
            "referralCode":referralCode,
            "organization":orgname
        }

        logger.info("Organization referral code GET successful: "+str(userID))

        return utils.return_200_response(body)
    
    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)

@profile.route("/app/organization/referralCode/refresh",methods=["GET"])
def refresh_organization_referral_code():

    try:
        endpoint = "/app/organization/referralCode/refresh"
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for "+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        logger.info("Organization referral code REFRESH attempt: "+str(userID))

        referralCode = dbops.generate_organization_referral_code(organizationID)

        if referralCode is None:
            return utils.return_400_error("Unexpected error occurred")
        

        body = {
            "referralCode":referralCode
        }

        logger.info("Organization referral code REFRESH successful: "+str(userID))

        return utils.return_200_response(body)
        
        
    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)