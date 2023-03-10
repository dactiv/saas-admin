export const router = [{
    path: "authentication/operational/audit",
    component: () => import("@/views/authentication/audit/Index.vue"),
    name: "authentication_audit",
    meta: {
        title: "操作审计",
        parent: "system"
    }
},{
    path: "authentication/operational/audit/detail",
    component: () => import("@/views/authentication/audit/Detail.vue"),
    name: "authentication_audit_detail",
    meta: {
        title: "查看操作审计",
        parent: "system",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/audit"
    }
},{
    path: "authentication/console/user",
    component: () => import("@/views/authentication/user/Index.vue"),
    name: "authentication_console_user",
    meta: {
        title: "后台用户管理",
        parent: "organization"
    }
},{
    path: "authentication/console/user/edit",
    component: () => import("@/views/authentication/user/Edit.vue"),
    name: "authentication_console_user_edit",
    meta: {
        title: "编辑后台用户",
        parent: "organization",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/console/user"
    }
},{
    path: "authentication/department",
    component: () => import("@/views/authentication/department/Index.vue"),
    name: "authentication_department",
    meta: {
        title: "部门管理",
        parent: "organization"

    }
},{
    path: "authentication/department/edit",
    component: () => import("@/views/authentication/department/Edit.vue"),
    name: "authentication_department_edit",
    meta: {
        title: "编辑部门",
        parent: "organization",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/department"
    }
},{
    path: "authentication/group",
    component: () => import("@/views/authentication/group/Index.vue"),
    name: "authentication_group",
    meta: {
        title: "组管理",
        parent: "authority"

    }
},{
    path: "authentication/group/edit",
    component: () => import("@/views/authentication/group/Edit.vue"),
    name: "authentication_group_edit",
    meta: {
        title: "编辑组",
        parent: "authority",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/group"
    }
},{
    path: "authentication/resource",
    component: () => import("@/views/authentication/resource/Index.vue"),
    name: "authentication_resource",
    meta: {
        title: "資源管理",
        parent: "authority"

    }
},{
    path: "authentication/resource/detail",
    component: () => import("@/views/authentication/resource/Detail.vue"),
    name: "authentication_resource_detail",
    meta: {
        title: "查看資源",
        parent: "authority",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/resource"
    }
},{
    path: "authentication/authentication/info",
    component: () => import("@/views/authentication/info/Index.vue"),
    name: "authentication_info",
    meta: {
        title: "用户登陆信息",
        parent: "system"
    }
},{
    path: "authentication/authentication/detail",
    component: () => import("@/views/authentication/info/Detail.vue"),
    name: "authentication_info_detail",
    meta: {
        title: "查看用户登陆信息",
        parent: "system",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/authentication/info"
    }
}]