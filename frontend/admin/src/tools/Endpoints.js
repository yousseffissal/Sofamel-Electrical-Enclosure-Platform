const API = {
  ADMIN: "/api/admin",
};

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API.ADMIN}/login`,
    LOGOUT: `${API.ADMIN}/logout`,
    LOGOUTALL: `${API.ADMIN}/logout-all`,
    ME: `${API.ADMIN}/get-me`,
    USERS: `${API.ADMIN}/users`,
    RESET: `${API.ADMIN}/update-password`,
  },

  ADMINS: {
    CREATE: `${API.ADMIN}/admin`,
    UPDATE: (id) => `${API.ADMIN}/admins/${id}`,
    DELETE: `${API.ADMIN}/admins`,
  },

  BOX: {
    GETBOXTYPES: `${API.ADMIN}/box-types`,
    CREATEBOXTYPE: `${API.ADMIN}/box-types`,

    DELETEBOXTYPE: (id) =>
      `${API.ADMIN}/box-types/${id}`,

    UPDATEBOXTYPE: (id) =>
      `${API.ADMIN}/box-types/${id}`,

    ADD_TEMPLATE: (id) =>
      `${API.ADMIN}/box-types/${id}/configurable-boxes`,

    ATTACH_TEMPLATE: (id) =>
      `${API.ADMIN}/box-types/${id}/configurable-boxes/attach`,

    REMOVE_TEMPLATE: (id) =>
      `${API.ADMIN}/box-types/${id}/configurable-boxes`,

    GETTEMPLATES: (id) =>
      `${API.ADMIN}/box-types/${id}/configurable-boxes`,

    GETALLTEMPLATES: `${API.ADMIN}/configurable-boxes`,

    GET_AVAILABLE_TEMPLATES:
      `${API.ADMIN}/available-configurable-boxes`,

    UPDATE_TEMPLATE: (id) =>
      `${API.ADMIN}/configurable-boxes/${id}`,

    DELETE_TEMPLATE:
      `${API.ADMIN}/configurable-boxes`,

    GETTEMPLATEITEMS: (id) =>
      `${API.ADMIN}/configurable-boxes/${id}/items`,

    GET_ALL_ITEMS:
      `${API.ADMIN}/items`,

    GET_BOX_AREAS: (id) =>
      `${API.ADMIN}/configurable-boxes/${id}/areas`,

    GET_AREAS: `${API.ADMIN}/areas`,
  },

  AREAS: {
    CREATE: `${API.ADMIN}/areas`,
  },

  ITEMS: {
    CONFIGURABLE_BOX_ITEMS: (id) =>
      `${API.ADMIN}/configurable-boxes/${id}/items`,

    ATTACH_ITEM_TO_BOX: (id) =>
      `${API.ADMIN}/configurable-boxes/${id}/items/attach`,

    UPDATE_ITEM: (id) =>
      `${API.ADMIN}/items/${id}`,

    DELETE_ITEM: (id) =>
      `${API.ADMIN}/items/${id}`,

    AVAILABLE_ITEMS: (id) =>
      `${API.ADMIN}/available-items/${id}`,

    ALL_ITEMS:
      `${API.ADMIN}/items`,
  },

  USERS: {
    CLIENTS: `${API.ADMIN}/clients`,
    DELETECLIENT: (id) =>
      `${API.ADMIN}/clients/${id}`,
    CLIENT_ORDERS: (id) =>
      `${API.ADMIN}/clients/${id}/orders`,
  },

  ORDERS: {
    GET_ALL: `${API.ADMIN}/orders`,

    GET_ONE: (id) =>
      `${API.ADMIN}/orders/${id}`,

    UPDATE_STATUS: (id) =>
      `${API.ADMIN}/orders/${id}/status`,

    DOWNLOAD_PDF: (id) =>
      `${API.ADMIN}/orders/${id}/pdf`,

    GET_ARCHIVED: `${API.ADMIN}/orders/archive`,

    ARCHIVE: (id) =>
      `${API.ADMIN}/orders/${id}/archive`,

    UNARCHIVE: (id) =>
      `${API.ADMIN}/orders/${id}/unarchive`,
  },

  DASHBOARD: {
    OVERVIEW: `${API.ADMIN}/dashboard/overview`,
  },

  REPORTS: {
    GET_ALL: `${API.ADMIN}/reports`,
    DELETE: (id) => `${API.ADMIN}/reports/${id}`,
  },

};

export default ENDPOINTS;