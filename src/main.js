import { createApp, createVNode, h } from 'vue';
import Antd,{Modal, message, notification} from 'ant-design-vue';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import App from './App';

import '@/assets/css/antdv.css';

import router from '@/router'
import store from '@/store'
import {PRINCIPAL_GETTER_TYPE} from '@/store/principal'

import axios from '@/http/index'
import VueAxios from 'vue-axios'

import { pinyin } from 'pinyin-pro';

import { createFromIconfontCN, ExclamationCircleOutlined } from '@ant-design/icons-vue';

const application = createApp(App);

const IconFont = createFromIconfontCN({
    scriptUrl: [
        // commons-icon
        "//at.alicdn.com/t/c/font_2732722_2z16w04bz35.js",
        // file-icon
        "//at.alicdn.com/t/font_2783178_o30jvdzd5vo.js"
    ]
});

application
    .use(Antd)
    .use(store)
    .use(router)
    .use(VueAxios, axios)
    .component('IconFont', IconFont)
    .mount('#app');

application.config.globalProperties.version = process.env.VUE_APP_VERSION;

application.config.globalProperties.$pinyin = pinyin;
application.config.globalProperties.$dayjs = dayjs;

application.config.globalProperties.$message = message;
application.config.globalProperties.$notification = notification;
application.config.globalProperties.$modal = Modal;

application.config.globalProperties.semesterCompleteMonthDay = dayjs();
application.config.globalProperties.attachmentFileSupport = [
    {name:"7z",icon:"icon-z"},
    {name:"avi",icon:"icon-AVI"},
    {name:"bat",icon:"icon-BAT"},
    {name:"ai",icon:"icon-AI"},
    {name:"bmp",icon:"icon-BMP"},
    {name:"css",icon:"icon-CSS"},
    {name:"conf",icon:"icon-CONF"},
    {name:"eot",icon:"icon-EOT"},
    {name:"docx",icon:"icon-DOCX"},
    {name:"doc",icon:"icon-DOC"},
    {name:"htm",icon:"icon-HTM"},
    {name:"html",icon:"icon-HTML"},
    {name:"ico",icon:"icon-ICO"},
    {name:"ini",icon:"icon-INI"},
    {name:"jar",icon:"icon-JAR"},
    {name:"java",icon:"icon-JAVA"},
    {name:"jpeg",icon:"icon-JPEG"},
    {name:"jpg",icon:"icon-JPG"},
    {name:"js",icon:"icon-JS"},
    {name:"md",icon:"icon-MD"},
    {name:"mp3",icon:"icon-MP"},
    {name:"mp4",icon:"icon-MP1"},
    {name:"mp5",icon:"icon-MP2"},
    {name:"mpge",icon:"icon-MPGE"},
    {name:"pdf",icon:"icon-PDF"},
    {name:"pl",icon:"icon-PL"},
    {name:"png",icon:"icon-PNG"},
    {name:"ppt",icon:"icon-PPT"},
    {name:"psd",icon:"icon-PSD"},
    {name:"py",icon:"icon-PY"},
    {name:"rar",icon:"icon-RAR"},
    {name:"rm",icon:"icon-RM"},
    {name:"sh",icon:"icon-SH"},
    {name:"svg",icon:"icon-SVG"},
    {name:"ttf",icon:"icon-TTF"},
    {name:"tar",icon:"icon-TAR"},
    {name:"text",icon:"icon-TEXT"},
    {name:"xlsx",icon:"icon-XLSX"},
    {name:"woff",icon:"icon-WOFF"},
    {name:"xml",icon:"icon-XML"},
    {name:"yml",icon:"icon-YML"},
    {name:"yaml",icon:"icon-YAML"},
    {name:"zip",icon:"icon-ZIP"},
    {name:"bin",icon:"icon-BIN"}
]
application.config.globalProperties.quillOption = {
    modules:{
        toolbar:[['bold', 'italic', 'underline', 'strike'],['blockquote', 'code-block'],[{ 'list': 'ordered'}, { 'list': 'bullet' }],[{ 'script': 'sub'}, { 'script': 'super' }],[{ 'indent': '-1'}, { 'indent': '+1' }],[{ 'direction': 'rtl' }], [{ 'color': [] }, { 'background': [] }], [{ 'align': [] }],['link','image','video','clean']]
    },
    validate(field, value) {
        if (value === "<p><br></p>" || value === undefined || value === "") {
            return Promise.reject();
        }
        return Promise.resolve();
    }
}

application.config.globalProperties.POST_DATETIME_FORMAT = process.env.VUE_APP_POST_DATETIME_FORMAT;
application.config.globalProperties.POST_DATE_FORMAT = process.env.VUE_APP_POST_DATE_FORMAT;
application.config.globalProperties.DATE_VALUE_FORMAT = process.env.VUE_APP_DATE_VALUE_FORMAT;
application.config.globalProperties.TIMESTAMP_FORMAT = process.env.VUE_APP_TIMESTAMP_FORMAT;
application.config.globalProperties.FRONT_END_URL = process.env.VUE_APP_FRONT_END_URL;

application.config.globalProperties.dateFormat = function(value) {
    return this.dayjsFormat(value, process.env.VUE_APP_DATE_VALUE_FORMAT);
}

application.config.globalProperties.timestampFormat = function(value) {
    return this.dayjsFormat(value, process.env.VUE_APP_TIMESTAMP_FORMAT);
}

application.config.globalProperties.postDateFormat = function(value) {
    return this.dayjsFormat(value, process.env.VUE_APP_POST_DATE_FORMAT);
}

application.config.globalProperties.postTimestampFormat = function(value) {
    return this.dayjsFormat(value, process.env.VUE_APP_POST_DATETIME_FORMAT);
}

application.config.globalProperties.filterDataSource = function (text, dataSource, searchFields, childrenFields) {
    let result = [];
    for (let i = 0; i < dataSource.length; i++) {
        let data = dataSource[i];
        let searchData = undefined;
        for (let j = 0; j < searchFields.length; j++) {
            let value = data[searchFields[j]];
            if (!value) {
                continue;
            }
            if (value.toString().indexOf(text) >= 0) {
                searchData = data;
                break;
            }
        }
        if (data.children) {
            let children = this.filterDataSource(text, data.children, searchFields, childrenFields);
            if (children.length > 0) {
                searchData = searchData || data;
                searchData.children = children;
            }
        }
        if (childrenFields) {
            for (let k = 0; k < childrenFields.length; k++) {
                let value = data[childrenFields[k]];
                if (!value) {
                    continue;
                }
                let children = this.filterDataSource(text, value, searchFields, childrenFields);
                if (children.length > 0) {
                    searchData = searchData || data;
                    searchData[childrenFields[k]] = children;
                }
            }
        }

        if (searchData) {
            result.push(searchData)
        }
    }

    return result;
}

application.config.globalProperties.getFileItemStatusClass = function(item) {
    if (item.status === 'uploading' || !item.status) {
        return 'secondary';
    } else if (item.status === 'error')  {
        return "danger";
    } else if (item.status === "done") {
        return "success";
    } else {
        return 'secondary';
    }
}

application.config.globalProperties.uploadFile = function(file, type, param, headers) {
    if (!file || !file.originFileObj) {
        return Promise.reject("上传文件不能为空");
    }

    return new Promise((resolve, reject) => {
        let blockSize = process.env.VUE_APP_UPLOAD_BLOCK_SIZE * 1;
        if (file.size < blockSize) {
            let config = {
                onUploadProgress: function (event) {
                    file.percent = Math.floor((event.loaded * 100) / file.size);
                    if (file.percent >= 100) {
                        file.status = 'done';
                    } else {
                        file.status = 'uploading'
                    }
                },
                headers: {'Content-Type': 'multipart/form-data'}
            }

            if (headers) {
                for (let key in headers) {
                    config.headers[key] = headers[key];
                }
            }

            let formData = new FormData();
            formData.append("file", file.originFileObj);

            if (param) {
                for (let key in param) {
                    formData.append(key, param[key]);
                }
            }

            this
                .$http
                .post("/api/resources/attachment/singleUpload/" + type, formData, config)
                .then((res) => {
                    let data = res.data.data;
                    data.size = file.size;
                    data.type = type;
                    resolve({res, data, file});
                })
                .catch((error) => {
                    file.status = 'error';
                    reject(error);
                });
        } else {
            let param = {
                objectName: file.name,
                contentType: file.contentType || 'application/octet-stream',
                chunkSize: Math.ceil(file.size / blockSize)
            }
            this
                .$http
                .post("/api/resources/attachment/createMultipartUpload/" + type, this.formUrlEncoded(param))
                .then(r => {
                    if (!r.data.data.chunk) {
                        file.status = 'error';
                        reject("没有可使用的分片上传路径");
                        return;
                    }

                    let blockSize = process.env.VUE_APP_UPLOAD_BLOCK_SIZE * 1;
                    let data = [];
                    for (let i = 1; i <= r.data.data.chunk.length; i++) {
                        let url = r.data.data.chunk[i - 1];
                        let nextSize = Math.min(i * blockSize, file.size);
                        let fileData = file.originFileObj.slice((i - 1) * blockSize, nextSize);
                        let info = {
                            id:i,
                            uploadSize:0
                        };

                        let config = {
                            onUploadProgress: function (event) {
                                let d = data.find(d => d.id === i);
                                d.uploadSize = event.loaded;
                                file.percent = Math.floor((data.reduce((sum, d) => sum + d.uploadSize, 0) * 100) / file.size);
                                if (file.percent >= 100) {
                                    file.status = 'done';
                                } else {
                                    file.status = 'uploading'
                                }
                            },
                            headers: {'Content-Type': 'application/octet-stream'},
                            param: this.formUrlEncoded({"partNumber": i})
                        }

                        info.promise = this.$http.put(url, fileData, config);
                        data.push(info);
                    }

                    Promise
                        .all(data.map(d => d.promise))
                        .then(() =>{
                            let completeParam = {
                                objectName:r.data.data.object.objectName,
                                id:r.data.data.id,
                                contentType:param.contentType
                            };

                            let completeConfig = {};
                            if (headers) {
                                completeConfig.headers = {};
                                for (let key in headers) {
                                    completeConfig.headers[key] = headers[key];
                                }
                            }

                            this
                                .$http
                                .post("/api/resources/attachment/completeMultipartUpload/" + type, this.formUrlEncoded(completeParam), completeConfig)
                                .then((res) => {
                                    let data = res.data.data;
                                    data.size = file.size;
                                    data.type = type;
                                    resolve({res, data, file});
                                }).catch(reason => {
                                    file.status = 'error';
                                    reject(reason);
                                });
                        })
                        .catch(reason => {
                            file.status = 'error';
                            reject(reason);
                        });

                })
                .catch(reason => {
                    file.status = 'error';
                    reject(reason);
                });
        }
    });
}

application.config.globalProperties.downloadFile = function(bucket, object, queryData) {
    let url = "/api/resources/attachment/query?bucketName="+ bucket + "&objectName=" + object;

    if(queryData) {
        url += queryData;
    }

    window.open(url);
}

application.config.globalProperties.dayjsFormat = function(value, format) {
    if (!value || value === "") {
        return "";
    }

    if (this.$dayjs.isDayjs(value)) {
        return value.format(format);
    }

    return dayjs(value).format(format);
}

application.config.globalProperties.setTrendChartMarkPoint = function(value, formatterText) {
    if (!value.data.find(v => v > 0)) {
        return;
    }
    value.markPoint = {data: [{ type: 'max', name: '最高峰值' }]}
    value.markLine = {
        data: [
            [
                {
                    symbol: 'none',
                    x: '50%',
                    yAxis: 'max'
                },
                {
                    symbol: 'circle',
                    label: {
                        position: 'start',
                        formatter: formatterText || '当前最高峰'
                    },
                    type: 'max'
                }
            ]
        ]
    }
}

application.config.globalProperties.byteFormat = function(bytes) {
    if (isNaN(bytes)) {
        return '';
    }
    let symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let exp = Math.floor(Math.log(bytes)/Math.log(2));
    if (exp < 1) {
        exp = 0;
    }
    let i = Math.floor(exp / 10);
    bytes = bytes / Math.pow(2, 10 * i);

    if (bytes.toString().length > bytes.toFixed(2).toString().length) {
        bytes = bytes.toFixed(2);
    }
    return bytes + ' ' + symbols[i];
};

application.config.globalProperties.convertFormUrlencoded = function(val) {

    if (this.$dayjs.isDayjs(val)) {
        return this.dayjsFormat(val, process.env.VUE_APP_POST_DATETIME_FORMAT);
    }

    return val;
}

application.config.globalProperties.formUrlEncoded = function(json, ignoreProperties, valueConvert) {

    let param = new URLSearchParams();

    let ignore = [];

    if (typeof ignoreProperties === 'string') {
        ignore.push(ignoreProperties);
    } else {
        ignore = ignoreProperties || [];
    }

    for (let j in json) {

        if (ignore.includes(j)) {
            continue;
        }

        let val = json[j];

        if (val === undefined || val === null) {
            continue;
        }

        if (valueConvert) {
            val = valueConvert(j, val);
        }

        if(Array.isArray(val)) {
            val.forEach(v => param.append(j, this.convertFormUrlencoded(v)))
        } else {
            param.append(j, this.convertFormUrlencoded(val));
        }

    }

    return param;
}

application.config.globalProperties.loadConfigEnumerate = function(params) {
    return this.$http.get(process.env.VUE_APP_SERVER_GET_ENUMERATE_URI_SUFFIX,{params: this.formUrlEncoded(params)})
}

application.config.globalProperties.loadConfigEnumerates = function(params) {
    return this.$http.post(process.env.VUE_APP_SERVER_GET_ENUMERATES_URI_SUFFIX, params)
}

application.config.globalProperties.loadConfigEnvironment = function(params) {
    return this.$http.get(process.env.VUE_APP_SERVER_GET_ENVIRONMENT_URI_SUFFIX,{params: this.formUrlEncoded(params)})
}

application.config.globalProperties.loadConfigDictionary= function(params) {
    return this.$http.get(process.env.VUE_APP_SERVER_FIND_DICTIONARY_URI_SUFFIX + "/" + params)
}

application.config.globalProperties.queryConfigDictionary= function(params) {
    return this.$http.post(process.env.VUE_APP_SERVER_QUERY_DICTIONARY_URI_SUFFIX,params)
}

application.config.globalProperties.saveDeviceIdentified = function(r) {
    let deviceIdentified = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_DEVICE_IDENTIFIED_NAME);

    if (!deviceIdentified) {
        deviceIdentified = r.data.data.deviceIdentified;
        localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_DEVICE_IDENTIFIED_NAME, deviceIdentified);
    }

    return deviceIdentified;
}

application.config.globalProperties.info = function(config) {
    Modal.info({
        title: config.title,
        width: config.width,
        okText:"关闭",
        content: h('div', {}, config.content)
    });
}

application.config.globalProperties.confirm = function(config, ok, cancel) {

    let props = {
        icon: createVNode(ExclamationCircleOutlined),
        onOk:ok,
        onCancel:cancel
    };

    if (typeof config === 'string') {
        props.title = config;
    } else {
        for (let key in config) {
            props[key] = config[key];
        }
    }

    Modal.confirm(props);

};

application.config.globalProperties.getFileIcon = function(filename) {

    let index = filename.lastIndexOf(".");

    if (index < 0) {
        return "icon-unkown";
    }

    let suffix = filename.substring(index + 1, filename.length);

    let icon = this.attachmentFileSupport.find(a => a.name === suffix);

    if (!icon) {
        return "icon-unkown";
    }

    return icon.icon
}

application.config.globalProperties.getPrincipalName = function(details) {
    let result = details.username;

    if (details.meta && details.meta.realName) {
        result = details.meta.realName;
    }

    return result;
}

application.config.globalProperties.principal = {
    details: store.state.principal,
    hasPermission: store.getters[PRINCIPAL_GETTER_TYPE.HAS_PERMISSION],
    hasAnyPermission: store.getters[PRINCIPAL_GETTER_TYPE.HAS_ANY_PERMISSION],
    hasRole: store.getters[PRINCIPAL_GETTER_TYPE.HAS_ROLE],
    hasAnyRole: store.getters[PRINCIPAL_GETTER_TYPE.HAS_ANY_ROLE],
}