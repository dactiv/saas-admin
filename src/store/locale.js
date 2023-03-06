import zhCn from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import { setValidateLanguage } from '@formily/core'

export const LOCALE_MUTATION_TYPE = {
    SET_LOCAL:"locale/setLocale",
    SET_SEMESTER_COMPLETE_DAY:"locale/setSemesterCompleteDay",
}

export const LOCALE_TYPE = [
    {
        app: zhCn,
        dayjs: "zh-cn",
        formily: "zhCn",
        name: "简体中文",
        video:"zh-CN",
        id: 1,
        semesterCompleteDay: dayjs()
    }
]

export default {
    namespaced:true,
    state: JSON.parse(JSON.stringify(LOCALE_TYPE[0])),
    mutations: {
        setSemesterCompleteDay(state, dayjs) {
            state.semesterCompleteDay = dayjs;
        },
        setLocale(state, id) {

            let locale = LOCALE_TYPE.find(d => d.id === id );

            for (let key in locale) {
                if (state[key]) {
                    state[key] = locale[key];
                }
            }

            dayjs.locale(state.dayjs);

            setValidateLanguage(state.formily);
        }
    }
}