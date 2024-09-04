import * as panelForm from './components/panel/form';
import { usePanelStore } from "./components/panel";
import { usePanelAdapterStore } from "./components/panel/props";
import { useRequest, useRequestStore, withUploadDriver } from './request';

import PanelTable from './components/panel/Table.vue'
import Table from './components/table/Index.vue';
import PanelForm from './components/panel/Form.vue';
import UploadFile from './components/upload/file.vue';
import AntSelect from './components/select/AntSelect.vue';
import Form from './components/form/Form.vue';
import ModalForm from './components/form/ModalForm.vue';
import Quill from './components/editor/quill/Index.vue';

export function withDefaults() {
  panelForm.withDefaults()
}


export {
  useRequest,
  usePanelStore,
  useRequestStore,
  withUploadDriver,
  usePanelAdapterStore,
  PanelTable,
  PanelForm,
  Table,
  UploadFile,
  AntSelect,
  Form,
  ModalForm,
  Quill
}