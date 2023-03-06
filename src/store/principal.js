import axios from "axios";

const defaultStatus = {
    id: 0,
    username: "未认证用户",
    roleAuthorities: [],
    type: 'Anonymous',
    status: {},
    authentication: false,
    rememberMe: false,
    resourceAuthorityStrings: [],
    avatar: undefined,
    token:"",
    meta:{},
    menus:[]
};

export const PRINCIPAL_MUTATION_TYPE = {
    SET_PRINCIPAL:"principal/setPrincipal",
    REFRESH_AVATAR:"principal/refreshAvatar",
    CLEAR_PRINCIPAL:"principal/clearPrincipal"
}

export const PRINCIPAL_ACTION_TYPE = {
    LOGIN:"principal/login",
    Logout:"principal/logout"
}

export const PRINCIPAL_GETTER_TYPE = {
    HAS_PERMISSION:"principal/hasPermission",
    HAS_ANY_PERMISSION:"principal/hasAnyPermission",
    HAS_ROLE:"principal/hasRole",
    HAS_ANY_ROLE:"principal/hasAnyRole"
}

export default {
    namespaced:true,
    state: JSON.parse(JSON.stringify(defaultStatus)),
    getters: {
        hasPermission: (state) => (permission) => {
            return state.resourceAuthorityStrings.includes(permission);
        },
        hasAnyPermission: (state) => (permissions) => {
            for (let permission of permissions) {
                if (state.resourceAuthorityStrings.includes(permission)) {
                    return true;
                }
            }
            return false;
        },
        hasAnyRole: (state) => (roles) => {
            for (let role of roles) {
                if (state.roleAuthorities.find(r => r.authority === role) !== null) {
                    return true;
                }
            }
            return false;
        },
        hasRole: (state) => (role) => {
            return state.roleAuthorities.find(r => r.authority === role);
        }
    },
    mutations: {
        refreshAvatar(state) {
            state.avatar = process.env.VUE_APP_USER_AVATAR_URI_PREFIX + "?date=" + new Date().getTime();
        },
        setPrincipal(state, principal) {

            for (let key in principal) {

                if (state[key] !== undefined) {
                    state[key] = principal[key];
                }

            }

            state.avatar = process.env.VUE_APP_USER_AVATAR_URI_PREFIX + "?date=" + new Date().getTime();
            if (!state.menus) {
                state.menus = [];
            }

        },
        clearPrincipal(state) {
            for (let key in defaultStatus) {

                if (state[key]) {
                    state[key] = defaultStatus[key];
                }

            }
        }
    },
    actions: {
        login(context, payload) {
            return new Promise((resolve, reject) => {
                axios
                    .post("/api/authentication/login", payload.data, {headers: {"X-AUTHENTICATION-TYPE": payload.role}})
                    .then(response => {
                        let data = response.data.data;
                        data.authentication = true;
                        context.commit("setPrincipal", data);
                        resolve(response)
                    })
                    .catch(e => reject(e));
            });
        },
        logout(context) {
            return new Promise((resolve, reject) => {
                axios
                    .post("/api/authentication/logout")
                    .then(r => {
                        context.commit("clearPrincipal", defaultStatus);
                        resolve(r.data.data);
                    })
                    .catch(e => reject(e));
            });
        }
    }
}