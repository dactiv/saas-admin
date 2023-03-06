export const router = [{
    path: "workflow/form",
    component: () => import("@/views/workflow/form/Index.vue"),
    name: "workflow_form",
    meta: {
        title: "流程表单管理",
        parent: "workflow"
    }
},{
    path: "workflow/form/detail",
    component: () => import("@/views/workflow/form/Edit.vue"),
    name: "workflow_form_detail",
    meta: {
        title: "编辑流程表单",
        parent: "workflow",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/workflow/form"
    }
},{
    path: "workflow/form/apply",
    component: () => import("@/views/workflow/form/Apply.vue"),
    name: "workflow_form_apply",
    meta: {
        title: "流程表单申请",
        parent: "workflow",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/workflow/apply"
    }
},{
    path: "workflow/work/myCreate",
    component: () => import("@/views/workflow/work/myCreate/Index.vue"),
    name: "workflow_work_my_create",
    meta: {
        title: "我创建的",
        parent: "workflow"
    }
},{
    path: "workflow/work/mySubmit",
    component: () => import("@/views/workflow/work/mySubmit/Index.vue"),
    name: "workflow_work_my_submit",
    meta: {
        title: "我提交的",
        parent: "workflow"
    }
},{
    path: "workflow/work/myPending",
    component: () => import("@/views/workflow/work/myPending/Index.vue"),
    name: "workflow_work_my_pending",
    meta: {
        title: "我的待办",
        parent: "workflow"
    }
},{
    path: "workflow/work/myProcessed",
    component: () => import("@/views/workflow/work/myProcessed/Index.vue"),
    name: "workflow_work_my_my_processed",
    meta: {
        title: "我的经办",
        parent: "workflow"
    }
},{
    path: "workflow/work/copyMe",
    component: () => import("@/views/workflow/work/copyMe/Index.vue"),
    name: "workflow_work_copy_me",
    meta: {
        title: "抄送我的",
        parent: "workflow"
    }
},{
    path: "workflow/apply",
    component: () => import("@/views/workflow/apply/Index.vue"),
    name: "workflow_apply",
    meta: {
        title: "流程表单管理",
        parent: "workflow"
    }
},{
    path: "workflow/apply/detail",
    component: () => import("@/views/workflow/apply/Detail.vue"),
    name: "workflow_apply_detail",
    meta: {
        title: "流程表单明细",
        parent: "workflow",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/workflow/apply"
    }
},{
    path: "workflow/schedule",
    component: () => import("@/views/workflow/schedule/Index.vue"),
    name: "workflow_schedule",
    meta: {
        title: "日程管理",
        parent: "workflow"
    }
},{
    path: "workflow/schedule/edit",
    component: () => import("@/views/workflow/schedule/Edit.vue"),
    name: "workflow_schedule_edit",
    meta: {
        title: "编辑日程",
        parent: "workflow",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/workflow/schedule"
    }
}]