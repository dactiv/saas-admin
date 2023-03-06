export const THEME = {
    dark:'icon-moon',
    default:'icon-sun',
    system:'icon-setting',
    value:'default',
    color: {
        primary:undefined,
        link:undefined,
        success:undefined,
        warning:undefined,
        error:undefined,
        componentBackground:undefined,
        blue:undefined,
        purple:undefined,
        cyan:undefined,
        green:undefined,
        magenta:undefined,
        red:undefined,
        orange:undefined,
        yellow:undefined,
        volcano:undefined,
        greyBlue:undefined,
        lime:undefined,
        gold:undefined,
    }
};

export const THEME_MUTATIONS_TYPE = {
    SET_THEME:"theme/setTheme",
    SET_COLOR:"theme/setColor"
}

export const THEME_ACTIONS_TYPE = {
    CHANGE_THEME:"theme/changeTheme"
}

export const THEME_GETTER_TYPE = {
    GET_THEME_VALUE:"theme/getThemeValue",
    GET_THEME_ICON:"theme/getThemeIcon",
    GET_SYSTEM_THEME:'theme/getSystemTheme'
}

export default {
    namespaced:true,
    state: JSON.parse(JSON.stringify(THEME)),
    getters: {
        getThemeValue:(state) => () => {
            return state.value;
        },
        getThemeIcon:(state) => () => {
            return state[state.value];
        },
        getSystemTheme:() => () => {
            let theme;
            let matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
            if (matchMedia.matches) {
                theme = "dark"
            } else {
                theme = "default";
            }
            return theme;
        }
    },
    mutations: {
        setTheme(state, value) {
            state.value = value;
            let html = document.getElementsByTagName("html")[0];
            html.setAttribute("data-theme", value);
        },
        setColor(state) {
            let html = document.getElementsByTagName("html")[0];
            let computedStyle = getComputedStyle(html);

            state.color.primary = computedStyle.getPropertyValue("--primary-color");
            state.color.success = computedStyle.getPropertyValue("--success-color");
            state.color.warning = computedStyle.getPropertyValue("--warning-color");
            state.color.error = computedStyle.getPropertyValue("--error-color");

            state.color.link = computedStyle.getPropertyValue("--link-color");

            state.color.componentBackground = computedStyle.getPropertyValue("--component-background");

            state.color.blue = computedStyle.getPropertyValue("--blue-color");
            state.color.purple = computedStyle.getPropertyValue("--purple-color");
            state.color.cyan = computedStyle.getPropertyValue("--cyan-color");
            state.color.green = computedStyle.getPropertyValue("--green-color");
            state.color.magenta = computedStyle.getPropertyValue("--magenta-color");
            state.color.red = computedStyle.getPropertyValue("--red-color");
            state.color.orange = computedStyle.getPropertyValue("--orange-color");
            state.color.yellow = computedStyle.getPropertyValue("--yellow-color");
            state.color.volcano = computedStyle.getPropertyValue("--volcano-color");
            state.color.greyBlue = computedStyle.getPropertyValue("--grey-blue-color");
            state.color.lime = computedStyle.getPropertyValue("--lime-color");
            state.color.gold = computedStyle.getPropertyValue("--gold-color");
        }
    },
    actions: {
        changeTheme(context, payload) {
            context.commit("setTheme", payload);
            context.commit("setColor");
        }
    }
}