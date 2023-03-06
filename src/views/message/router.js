export const router = [{
    path: "message/batch",
    component: () => import("@/views/message/batch/Index.vue"),
    name: "message_batch",
    meta: {
        title: "批量消息管理",
        parent: "message"
    }
},{
    path: "message/batch/detail",
    component: () => import("@/views/message/batch/Detail.vue"),
    name: "message_batch_detail",
    meta: {
        title: "批量消息明细",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/batch"
    }
},{
    path: "message/site",
    component: () => import("@/views/message/site/Index.vue"),
    name: "message_site",
    meta: {
        title: "站内信管理",
        parent: "message"

    }
},{
    path: "message/site/send",
    component: () => import("@/views/message/site/Send.vue"),
    name: "message_site_send",
    meta: {
        title: "发送站内信",
        parent: "message",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/site"
    }
},{
    path: "message/site/detail",
    component: () => import("@/views/message/site/Detail.vue"),
    name: "message_site_detail",
    meta: {
        title: "站内信详情",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/site"
    }
},{
    path: "message/sms",
    component: () => import("@/views/message/sms/Index.vue"),
    name: "message_sms",
    meta: {
        title: "短信管理",
        parent: "message"

    }
},{
    path: "message/sms/send",
    component: () => import("@/views/message/sms/Send.vue"),
    name: "message_sms_send",
    meta: {
        title: "发送短信",
        parent: "message",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/sms"
    }
},{
    path: "message/sms/detail",
    component: () => import("@/views/message/sms/Detail.vue"),
    name: "message_sms_detail",
    meta: {
        title: "短信详情",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/sms"
    }
},{
    path: "message/email",
    component: () => import("@/views/message/email/Index.vue"),
    name: "message_email",
    meta: {
        title: "邮件管理",
        parent: "message"

    }
},{
    path: "message/email/send",
    component: () => import("@/views/message/email/Send.vue"),
    name: "message_email_send",
    meta: {
        title: "发送邮件",
        parent: "message",
        authentication: true,
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/email"
    }
},{
    path: "message/email/detail",
    component: () => import("@/views/message/email/Detail.vue"),
    name: "message_email_detail",
    meta: {
        title: "邮件详情",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/email"
    }
},{
    path: "message/notice",
    component: () => import("@/views/message/notice/Index.vue"),
    name: "message_notice",
    meta: {
        title: "公告管理",
        parent: "message"
    }
},{
    path: "message/notice/edit",
    component: () => import("@/views/message/notice/Edit.vue"),
    name: "message_notice_edit",
    meta: {
        title: "编辑公告",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/notice"
    }
},{
    path: "message/evaluate",
    component: () => import("@/views/message/evaluate/Index.vue"),
    name: "message_evaluate",
    meta: {
        title: "评价管理",
        parent: "message"

    }
},{
    path: "message/evaluate/detail",
    component: () => import("@/views/message/evaluate/Detail.vue"),
    name: "message_evaluate_detail",
    meta: {
        title: "评价明细",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/evaluate"
    }
},{
    path: "message/comment",
    component: () => import("@/views/message/comment/Index.vue"),
    name: "message_comment",
    meta: {
        title: "评论管理",
        parent: "message"

    }
},{
    path: "message/comment/detail",
    component: () => import("@/views/message/comment/Detail.vue"),
    name: "message_comment_detail",
    meta: {
        title: "评论明细",
        parent: "message",
        selectMenu: process.env.VUE_APP_SITE_ROOT + "/message/comment"
    }
}]