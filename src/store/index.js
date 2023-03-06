import { createStore } from 'vuex'

import principal, {PRINCIPAL_MUTATION_TYPE} from '@/store/principal'
import locale, {LOCALE_MUTATION_TYPE} from '@/store/locale'
import theme, {THEME_ACTIONS_TYPE, THEME_GETTER_TYPE} from '@/store/theme';

const storeSubscribeMethod = {
  [PRINCIPAL_MUTATION_TYPE.SET_PRINCIPAL](mutation) {
    localStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_PRINCIPAL_NAME, JSON.stringify(mutation.payload));
  },
  [PRINCIPAL_MUTATION_TYPE.CLEAR_PRINCIPAL]() {
    localStorage.removeItem(process.env.VUE_APP_SESSION_STORAGE_PRINCIPAL_NAME);
  },
  [LOCALE_MUTATION_TYPE.SET_LOCAL](mutation) {
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_LOCALE_NAME, mutation.payload);
  }
};

const storagePlugin = (store) => {

  store.subscribe((mutation) => {
    if (!storeSubscribeMethod[mutation.type]) {
      return ;
    }
    storeSubscribeMethod[mutation.type](mutation)
  });

  let principal = JSON.parse(localStorage.getItem(process.env.VUE_APP_SESSION_STORAGE_PRINCIPAL_NAME));

  if (principal) {
    store.commit(PRINCIPAL_MUTATION_TYPE.SET_PRINCIPAL, principal);
  }

  let localeId = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_LOCALE_NAME) || 1;

  if (localeId) {
    store.commit(LOCALE_MUTATION_TYPE.SET_LOCAL, localeId * 1);
  }

  let theme = localStorage.getItem(process.env.VUE_APP_THEME_NAME);

  if (!theme) {
    theme = store.getters[THEME_GETTER_TYPE.GET_SYSTEM_THEME]();
  }
  store.dispatch(THEME_ACTIONS_TYPE.CHANGE_THEME, theme);
}

export default createStore({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    principal:principal,
    locale:locale,
    theme:theme
  },
  plugins:[storagePlugin]
})
