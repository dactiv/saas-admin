export const router = [{
    path: "config/dictionary",
    component: () => import("@/views/config/dictionary/Index.vue"),
    name: "config_dictionary",
    meta: {
        title: "数据字典管理",
        parent: "basic"
    }
},{
    path: "config/dictionary/edit",
    component: () => import("@/views/config/dictionary/DictionaryTypeEdit.vue"),
    name: "config_dictionary_type_edit",
    meta: {
        title: "编辑字典类型",
        parent: "basic",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
},{
    path: "config/dictionary/data/edit",
    component: () => import("@/views/config/dictionary/DataDictionaryEdit.vue"),
    name: "config_data_dictionary_edit",
    meta: {
        title: "编辑数据字典",
        parent: "basic",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/dictionary"
    }
},{
    path: "config/enumerate",
    component: () => import("@/views/config/Enumerate.vue"),
    name: "config_enumerate",
    meta: {
        title: "系统枚举查询",
        parent: "basic"

    }
},{
    path: "config/environment",
    component: () => import("@/views/config/Environment.vue"),
    name: "config_environment",
    meta: {
        title: "环境变量查询",
        parent: "basic"
    }
},{
    path: "config/export",
    component: () => import("@/views/config/Export.vue"),
    name: "resource_export",
    meta: {
        title: "导出数据查询",
        parent: "resource"
    }
},{
    path: "config/attachment",
    component: () => import("@/views/config/Attachment.vue"),
    name: "resource_attachment",
    meta: {
        title: "上传内容管理",
        parent: "resource"
    }
},{
    path: "config/carousel",
    component: () => import("@/views/config/carousel/Index.vue"),
    name: "config_carouse",
    meta: {
        title: "轮播图管理",
        parent: "basic"
    }
},{
    path: "config/carousel/edit",
    component: () => import("@/views/config/carousel/Edit.vue"),
    name: "config_carouse_edit",
    meta: {
        title: "编辑轮播图",
        authentication: true,
        parent: "basic",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/carousel"
    }
},{
    path: "config/access/crypto",
    component: () => import("@/views/config/access/crypto/Index.vue"),
    name: "config_access_crypto",
    meta: {
        title: "访问加解密",
        parent: "basic"
    }
},{
    path: "config/access/crypto/edit",
    component: () => import("@/views/config/access/crypto/Edit.vue"),
    name: "config_access_crypto_edit",
    meta: {
        title: "编辑访问加解密",
        parent: "basic",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/config/access/crypto"
    }
}]