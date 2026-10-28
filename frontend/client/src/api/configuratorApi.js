// src/api/configuratorApi.js
import api from "./axios.js";
import ENDPOINTS from "../tools/Endpoints.js";

/* =========================
   BOX TYPES
========================= */

export const getBoxTypes = () => {
  return api.get(ENDPOINTS.CONFIGURATOR.BOX_TYPES);
};

/* =========================
   TEMPLATES
========================= */

export const getTemplates = (boxTypeId) => {
  return api.get(
    ENDPOINTS.CONFIGURATOR.BOX_TYPE_TEMPLATES(boxTypeId)
  );
};

/* =========================
   AREAS
========================= */

export const getAreas = (templateId) => {
  return api.get(
    ENDPOINTS.CONFIGURATOR.TEMPLATE_AREAS(templateId)
  );
};

/* =========================
   AREA ITEMS
========================= */

export const getAreaItems = (templateId, areaId) => {
  return api.get(
    ENDPOINTS.CONFIGURATOR.AREA_ITEMS(templateId, areaId)
  );
};

export const sendOrder = (data) => {
  return api.post(
    ENDPOINTS.CONFIGURATOR.SEND_ORDER(),
    data
  );
};


export const getOrders = () => {
  return api.get(
    ENDPOINTS.ORDERS.GET_ORDERS()
  );
};

export const getOrder = (id) => {
  return api.get(
    ENDPOINTS.ORDERS.GET_ORDER(id)
  );
};

export const downloadOrderPdf = (id) => {
  return api.get(
    ENDPOINTS.ORDERS.DOWNLOAD_PDF(id),
    { responseType: "blob" }
  );
}

export const saveConfiguration = (data) => {
  return api.post(ENDPOINTS.CONFIGURATOR.CONFIGURATIONS, data);
};

export const getConfigurations = () => {
  return api.get(ENDPOINTS.CONFIGURATOR.CONFIGURATIONS);
};

export const deleteConfiguration = (id) => {
  return api.delete(ENDPOINTS.CONFIGURATOR.CONFIGURATION(id));
};

export const checkoutConfiguration = (id, data) => {
  return api.post(`${ENDPOINTS.CONFIGURATOR.CONFIGURATION(id)}/checkout`, data);
};