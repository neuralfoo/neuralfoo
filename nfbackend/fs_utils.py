import requests
from loguru import logger
import env_vars as e
import os
import secrets
import string

def get_new_filename(folder,filetype):

    filename = None
    filepath = None

    while(1):
        alphabet = string.ascii_letters + string.digits
        filename = ''.join(secrets.choice(alphabet) for i in range(32)) + "." + filetype
        filepath = os.path.join(folder, filename)
        if os.path.isfile(filepath):
            continue
        else:
            break

    return filepath,filename



def get_upload_url():

    r = requests.get(e.seaweedfs_master+"/dir/assign")

    if r.status_code == 200:

        body = r.json()

        return "http://"+body["publicUrl"]+"/"+body["fid"]

    else:
        logger.error("Seaweed fs not working as expected.")
        return None


def upload_to_fs(filepath):


    uploadurl = get_upload_url()

    filename = filepath.split("/")[-1]

    file_to_upload = {'file':(filename, open(filepath, 'rb'), "multipart/form-data")}

    r = requests.post(uploadurl, files=file_to_upload)

    if r.status_code == 201:
        logger.info("File uploaded : "+uploadurl)
        return uploadurl

    else:
        return None

def delete_from_fs(fileurl):

    r = requests.delete(fileurl)

    if r.status_code == 202:
        return True
    else:
        return False



def download_from_fs(fileurl):

    with requests.get(fileurl, stream=True) as r:
        r.raise_for_status()
        local_filepath,_=get_new_filename(folder="./trove/",filetype="")
        with open(local_filepath, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192): 
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                #if chunk: 
                f.write(chunk)
    return local_filepath


if __name__=="__main__":

    pass

    # a = upload_to_fs("/home/robbie/Downloads/passport1-front.jpeg")
    # print(a)
    # delete_from_fs(a)
