import { toast } from 'react-toastify';



function sendErrorNotification(message){
  toast.error(message);
}

function sendSuccessNotification(message){
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
}

const notif = {
  error:sendErrorNotification,
  success:sendSuccessNotification
}

export default notif;

