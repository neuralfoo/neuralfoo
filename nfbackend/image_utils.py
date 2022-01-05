import cv2
import os
import string
import secrets
import hashlib
import mmap
from loguru import logger


def get_image_data(filepath):

    try:

        filesize = os.stat(filepath).st_size
        img = cv2.imread(filepath)
        imagehash = sha256sum(filepath)

        #                height      width					
        return filesize,img.shape[0],img.shape[1],imagehash
        
    except Exception as e:
        logger.error("Error while getting image data. "+str(e))
        return None,None,None,None

def sha256sum(filename):
    print(filename)
    h  = hashlib.sha256()
    with open(filename, 'rb') as f:
        with mmap.mmap(f.fileno(), 0, prot=mmap.PROT_READ) as mm:
            h.update(mm)
    return str(h.hexdigest())

