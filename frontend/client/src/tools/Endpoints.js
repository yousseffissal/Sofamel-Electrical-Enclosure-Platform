const API = {
  USER: "/api/user",
};

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API.USER}/login`,
    REGISTER: `${API.USER}/register`,
    LOGOUT: `${API.USER}/logout`,
    LOGOUTALL: `${API.USER}/logout-all`,
    ME: `${API.USER}/get-me`,
    FORGET: `${API.USER}/forgot-password`,
    VERIFY_RESET_TOKEN: `${API.USER}/verify-reset-token`,
    RESET: `${API.USER}/reset-password`,
  },

  CONFIGURATOR: {
    BOX_TYPES: `${API.USER}/box-types`,
    BOX_TYPE_TEMPLATES: (boxTypeId) =>
      `${API.USER}/box-types/${boxTypeId}/templates`,

    TEMPLATE_AREAS: (templateId) =>
      `${API.USER}/templates/${templateId}/areas`,

    AREA_ITEMS: (templateId, areaId) =>
      `${API.USER}/templates/${templateId}/areas/${areaId}/items`,

    CONFIGURATIONS: `${API.USER}/client/configurations`,
    CONFIGURATION: (id) => `${API.USER}/client/configurations/${id}`,

    SEND_ORDER: () => `${API.USER}/orders`,
  },

  ORDERS: {
    GET_ORDERS: () => `${API.USER}/orders`,
    GET_ORDER: (id) => `${API.USER}/orders/${id}`,
    DOWNLOAD_PDF: (id) => `${API.USER}/orders/${id}/pdf`,
  },

  REPPORTS: {
    SEND_REPPORT:`${API.USER}/reports`,
  }
};

export default ENDPOINTS;
