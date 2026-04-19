import axios from "axios";

const API = "http://localhost:4000/api/ai";

export const sendMessage = async (
  message,
  collectedData,
  customerData,
  lastAskedField,
  awaitingConfirmation,
  collectingCustomer,
  awaitingCustomerConfirm
) => {
  const res = await axios.post(`${API}/chat`, {
    message,
    collectedData,
    customerData,
    lastAskedField,
    awaitingConfirmation,
    collectingCustomer,
    awaitingCustomerConfirm,
  });
  return res.data;
};