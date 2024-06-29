import { App } from "vue";
import Modal from "./modal/index";
export { Modal };

export default {
  install(app: App) {
    app.component("Modal", Modal);
  },
};
