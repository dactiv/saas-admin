<template>
  <div class="height-100-percent">
    <a-drawer ref="site-message-drawer" class="site-message-drawer" v-model:visible="this.siteMessage.visible" size="large" :bodyStyle="{padding:0, overflow:'hidden'}" :closable="false" placement="right">
      <template #title>
        <icon-font type="icon-notification" />
        站内信消息
      </template>
      <template #extra>
        <a-dropdown size="small" type="text" placement="bottomLeft">
          <template #overlay>
            <a-menu @click="handleSiteMessageMenuClick($event)">
              <a-menu-item key="readAll" :disabled="!this.siteMessageCount > 0">
                <a-space>
                  <icon-font class="icon" type="icon-complete" />
                  标记所有为已读
                </a-space>
              </a-menu-item>
              <a-menu-item key="deleteRead">
                <a-space>
                  <icon-font class="icon" type="icon-ashbin" />
                  删除所有已读消息
                </a-space>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button size="small">
            <icon-font class="icon" type="icon-setting"/>
            操作
          </a-button>
        </a-dropdown>
      </template>
      <div class="padding-left padding-right">
        <a-tabs v-model:activeKey="this.siteMessage.activeKey" @change="siteMessageTabChange">
          <a-tab-pane :key="tab.key" size="small" v-for="tab of this.siteMessage.tabs">
            <template #tab>
              <a-badge dot :count="tab.count">
                <icon-font class="icon" :type="this.siteMessage.icon[tab.key.toString()]" /> {{tab.name}}
              </a-badge>
            </template>
            <div class="tab-pane-content" @scroll="this.onSiteMessageContentScroll($event, tab.key)">

              <a-list item-layout="horizontal" :data-source="this.siteMessage.dataSource[tab.key].elements">
                <template #renderItem="{ item }">
                  <a href="javascript:;" @click="this.readSiteMessage(item, tab.key)">
                    <a-list-item>
                      <template #actions>
                        <a-button size="small" danger @click="this.confirm('确定要删除[' + item.title + '] 消息吗？',()=>this.deleteSiteMessage(item.id, tab.key, $event))">
                          <icon-font class="icon" type="icon-ashbin" />
                          <span class="hidden-xs hidden-sm hidden-md">删除</span>
                        </a-button>
                      </template>
                      <a-list-item-meta>
                        <template #description>
                          <a-typography-paragraph type="secondary" class="margin-none" :ellipsis="item.ellipsis" :content="item.content"/>
                        </template>
                        <template #title>
                          <a-row :gutter="[12]" type="flex" justify="space-around" align="middle">
                            <a-col :span="20">
                              <a-row v-if="item.readable.value === 1">
                                <a-col :span="1">
                                  <a-badge status="error" />
                                </a-col>
                                <a-col :span="23">
                                  <a-typography-title :level="5" :ellipsis="true" :content="item.title" class="margin-none" />
                                </a-col>
                              </a-row>
                              <a-typography-title v-else :level="5" :ellipsis="true" :content="item.title" class="margin-none" />
                            </a-col>
                            <a-col :span="4">
                              <a-tooltip :title="this.$dayjs(item.creationTime).format(this.POST_DATETIME_FORMAT)">
                                <a-typography-text type="secondary">{{ this.$dayjs(item.creationTime).fromNow() }}</a-typography-text>
                              </a-tooltip>
                            </a-col>
                          </a-row>
                        </template>
                        <template #avatar>
                          <icon-font :type="this.siteMessage.icon[tab.key]" />
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </a>
                  <a-divider class="margin-none"/>
                </template>
              </a-list>
              <div class="text-center" v-if="!this.siteMessage.dataSource[tab.key].last">
                <a-typography-text type="secondary" >数据加载中...</a-typography-text>
              </div>
            </div>
          </a-tab-pane>
          <template #rightExtra>
            <a-input v-model:value="this.siteMessage.searchText" placeholder="请输入标题/内容称进行查询" @pressEnter="this.loadSiteMessage(this.siteMessage.activeKey, 1)" >
              <template #addonAfter>
                <a-button type="text" size="small" :loading="this.siteMessage.loading" @click="this.loadSiteMessage(this.siteMessage.activeKey, 1)">
                  <icon-font class="icon" v-if="!this.siteMessage.loading" type="icon-search" />
                  <span class="hidden-xs hidden-sm hidden-md">搜索</span>
                </a-button>
              </template>
            </a-input>
          </template>
        </a-tabs>
      </div>
    </a-drawer>
    <a-layout class="height-100-percent">

      <a-layout-header :class="menu.collapsed ? 'header-navbar border-radius-lg basic-box-shadow toggle' : 'header-navbar border-radius-lg basic-box-shadow'">
        <a-row type="flex" justify="space-between">
          <a-col :span="12">
            <a-menu mode="horizontal" class="left">
              <a-menu-item key="toggle" @click="toggleCollapsed" class="hidden-xs hidden-sm">
                <icon-font class="icon" :type="menu.collapsed ? 'icon-not-collapsed' : 'icon-collapsed'" />
              </a-menu-item>
              <a-menu-item key="workbench" @click="this.$router.push({name: 'workbench'})">
                <icon-font class="icon" type="icon-workbench" />
              </a-menu-item>
              <a-menu-item key="dashboard" v-if="this.principal.hasAnyPermission(['perms[chapter_class_hour_content:statistics_views_trend]','perms[authentication_statistics:count_student_and_teacher]','perms[curriculum:statistics]','perms[user_file:statistics_top]','perms[curriculum:statistics_top]','perms[resource_system:statistics_keyword]'])" @click="this.$router.push({name: 'dashboard'})">
                <icon-font class="icon" type="icon-dashboard" />
              </a-menu-item>
              <a-menu-item key="site-message" @click="this.siteMessage.visible = true;">
                <a-badge dot :count="this.siteMessageCount">
                  <icon-font class="icon" type="icon-notification" />
                </a-badge>
              </a-menu-item>
            </a-menu>
          </a-col>
          <a-col :span="12">
            <a-menu mode="horizontal" class="right">
              <a-sub-menu key="themes">
                <template #title>
                  <icon-font class="icon" :type="this.$store.state.theme[this.$store.state.theme.value]" />
                </template>
                <a-menu-item key="default">
                  <a-button type="text" @click="changeTheme('default')">
                    <icon-font class="icon" type="icon-sun" /> 白昼模式
                  </a-button>
                </a-menu-item>
                <a-menu-item key="dark">
                  <a-button type="text" @click="changeTheme('dark')">
                    <icon-font class="icon" type="icon-moon" /> 夜间模式
                  </a-button>
                </a-menu-item>
                <a-menu-item key="system">
                  <a-button type="text" @click="changeTheme('system')">
                    <icon-font class="icon" type="icon-setting" /> 跟随系统
                  </a-button>
                </a-menu-item>
              </a-sub-menu>

              <a-sub-menu key="profile">
                <template #icon>
                  <a-avatar :src="this.principal.details.avatar" />
                </template>
                <template #title>{{ getPrincipalName(this.principal.details) }}</template>
                <a-menu-item key="setting">
                  <a-button type="text" @click="this.$router.push({name:'profile'})">
                    <icon-font class="icon" type="icon-setting" /> 系统设置
                  </a-button>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <a-button type="text" @click="logout()">
                    <icon-font class="icon" type="icon-sign-out" /> 退出登录
                  </a-button>
                </a-menu-item>
              </a-sub-menu>
            </a-menu>
          </a-col>
        </a-row>
      </a-layout-header>

      <a-layout class="height-100-percent">

        <a-layout-sider class="main-aside" width="260" v-model:collapsed="menu.collapsed" :trigger="null" collapsible>
          <div class="logo text-center">
            <router-link to='/'>
              <img src="@/assets/logo.png" :style="!menu.collapsed ? {width: '85px', height:'85px'} : {width: '30px', height:'30px'}"/>
              <a-typography-title :level="5" class="margin-none margin-top">
                <a-typography-text type="secondary">
                  {{ this.version }}
                </a-typography-text>
              </a-typography-title>
            </router-link>
          </div>
          <div class="main-menu">
            <a-spin :spinning="spinning" tip="初始化导航...">
              <a-menu mode="inline" :selectedKeys="menu.selectedKeys" :openKeys="menu.openKeys" @openChange="menuOpen" >
                <recursion-menu :data="this.principal.details.menus" />
              </a-menu>
            </a-spin>
          </div>
        </a-layout-sider>

        <a-layout-content :class="menu.collapsed ? 'main-content height-100-percent toggle' : 'main-content height-100-percent'">
          <div class="header-navbar-shadow"></div>
          <div class="content-body">
            <router-view v-if="this.isRouterAlive" v-slot="{ Component }">
              <transition name="fade-transform" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
          <a-layout-footer class="main-footer text-center">COPYRIGHT © 2022 新优学信息科技有限公司, All rights ReservedHand-crafted & Made with {{this.version}}</a-layout-footer>
        </a-layout-content>

      </a-layout>

    </a-layout>
  </div>
</template>

<script>

import RecursionMenu from '@/components/RecursionMenu.vue'

import { PRINCIPAL_MUTATION_TYPE } from "@/store/principal"
import { LOCALE_MUTATION_TYPE } from "@/store/locale"
import {THEME_GETTER_TYPE, THEME_ACTIONS_TYPE} from "@/store/theme"

export default {
  name: "Index",
  components:{RecursionMenu},
  provide() {
    return {
      reload: this.reload
    }
  },
  computed:{
    siteMessageCount() {
      return this.siteMessage.tabs.reduce((sum, c) => sum += c.count, 0);
    }
  },
  created() {
    let _this = this;

    window.onresize = () => {
      return (() => {
        if (document.body.clientWidth < 992) {
          _this.menu.collapsed = true;
        } else {
          let collapsed = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_MENU_COLLAPSED_NAME);

          if (collapsed !== "true") {
            _this.menu.collapsed = false;
          }
        }
      })()
    }

    let collapsed = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_MENU_COLLAPSED_NAME);

    if (collapsed === "true") {
      _this.menu.collapsed = true;
    }

    _this.$http
        .get("/api/authentication/prepare")
        .then(_this.postPrepare)
        .catch(() => _this.$router.push(process.env.VUE_APP_LOGIN_PAGE));

    _this.loadConfigEnumerate({service:"config",enumerateName:"MessageTypeEnum"}).then(r => {

      for (let key in r.data.data) {
        _this.siteMessage.tabs.push({key:r.data.data[key], name:key, count:0});
        this.siteMessage.dataSource[r.data.data[key]] = JSON.parse(JSON.stringify(this.siteMessage.defaultDataSource));
      }
      _this.siteMessage.activeKey = this.siteMessage.tabs[0].key;
      _this.loadSiteMessage(_this.siteMessage.activeKey);
      _this.loadSiteMessageUnreadQuantity()
    });
  },
  methods: {
    changeTheme(theme) {
      if (theme === 'system') {
        theme = this.$store.getters[THEME_GETTER_TYPE.GET_SYSTEM_THEME]();
        this.$store.dispatch(THEME_ACTIONS_TYPE.CHANGE_THEME, theme);
        localStorage.removeItem(process.env.VUE_APP_THEME_NAME);
      } else {
        this.$store.dispatch(THEME_ACTIONS_TYPE.CHANGE_THEME, theme);
        localStorage.setItem(process.env.VUE_APP_THEME_NAME, theme);
      }
    },
    onSiteMessageContentScroll(event, key) {
      let scrollTop = event.target.scrollTop;
      let clientHeight = event.target.clientHeight;

      if (clientHeight + scrollTop !== event.target.scrollHeight) {
        return;
      }

      this.loadSiteMessage(key);
    },
    loadSiteMessageUnreadQuantity() {
      this.$http.get("/api/message/site/unreadQuantity").then(r => {
        for (let key in r.data.data) {
          let tab = this.siteMessage.tabs.find(t => t.key === key * 1);
          if (!tab) {
            continue;
          }
          tab.count = r.data.data[key];
        }
      });
    },
    handleSiteMessageMenuClick(e) {
      if (e.key === 'readAll') {
        this.readAllSiteMessage();
      } else if (e.key === "deleteRead") {
        this.confirm("确定要删除所有已读信息吗？", () => this.deleteReadSiteMessage())
      }
    },
    readAllSiteMessage() {
      this.$http.post("/api/message/site/readAll").then(r => {
        this.$message.success(r.data.message);
        this.siteMessage.tabs.forEach(t => t.count = 0);
        for (let key in this.siteMessage.dataSource) {
          this.siteMessage.dataSource[key] = JSON.parse(JSON.stringify(this.siteMessage.defaultDataSource));
        }
        this.loadSiteMessage(this.siteMessage.activeKey);
      });
    },
    deleteReadSiteMessage() {
      this.$http.post("/api/message/site/deleteRead").then(r => {
        this.$message.success(r.data.message);
        for (let key in this.siteMessage.dataSource) {
          this.siteMessage.dataSource[key] = JSON.parse(JSON.stringify(this.siteMessage.defaultDataSource));
        }
        this.loadSiteMessage(this.siteMessage.activeKey);
      });
    },
    deleteSiteMessage(id,key, event) {
      event.stopPropagation();
      this.$http.post("/api/message/site/delete", this.formUrlEncoded({ids:[id]})).then(() => {
        let e = this.siteMessage.dataSource[key].elements.find(e => e.id === id);
        let index = this.siteMessage.dataSource[key].elements.indexOf(e);
        this.siteMessage.dataSource[key].elements.splice(index, 1);
      })
    },
    readSiteMessage(item, key) {
      item.ellipsis = !item.ellipsis;
      if (item.readable.value === 1) {
        this.$http.post("/api/message/site/read", this.formUrlEncoded({id:item.id})).then(() => {
          let e = this.siteMessage.dataSource[key].elements.find(e => e.id === item.id);
          if (e) {
            e.readable.value = 0;
          }
          let tab = this.siteMessage.tabs.find(t => t.key === key * 1);
          if (tab) {
            tab.count--;
          }
        });
      }

      if (!item.meta || !item.meta.link) {
        return ;
      }

      let name = this.siteMessage.link[item.meta.link.type];
      if (!name) {
        return;
      }
      this.siteMessage.visible = false;
      let to = {name:name};
      if (item.meta.link.id) {
        to.query = {id:item.meta.link.id};
      }
      this.$router.push(to);
      if (this.$route.name === to.name) {
        this.reload();
      }
    },
    siteMessageTabChange(key) {
      if (this.siteMessage.dataSource[key].elements.length > 0) {
        return ;
      }
      this.loadSiteMessage(key);
    },
    loadSiteMessage(key, number) {
      if (this.siteMessage.dataSource[key].last && this.siteMessage.dataSource[key].elements.length > 0) {
        return ;
      }
      let param = {
        number:number || this.siteMessage.dataSource[key].number,
        size:this.siteMessage.dataSource[key].size,
      };

      param["filter_[type_eq]"] = key;
      param["filter_[title_like]_or_[content_like]"] = this.siteMessage.searchText;

      this.$http.post("/api/message/site/pageByPrincipal", this.formUrlEncoded(param)).then(r => {
        if (r.data.data.elements) {
          r.data.data.elements.forEach(e => e.ellipsis = true);
          this.siteMessage.dataSource[key].elements.push(...r.data.data.elements);
        }

        this.siteMessage.dataSource[key].last = r.data.data.last;
        this.siteMessage.dataSource[key].number = this.siteMessage.dataSource[key].number + 1;
      });
    },
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => this.isRouterAlive = true);
    },
    postPrepare(r) {
      let data = r.data.data;

      if (data.authentication) {
        let details = JSON.parse(JSON.stringify(this.principal.details));

        details.authentication = data.authentication;
        details.rememberMe = data.rememberMe;

        this.$store.commit(PRINCIPAL_MUTATION_TYPE.SET_PRINCIPAL, details);

      } else {
        this.$store.commit(PRINCIPAL_MUTATION_TYPE.CLEAR_PRINCIPAL);
      }

      if (this.principal.details.rememberMe === true && this.$route.meta.authentication) {
        sessionStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME, this.$route.path);
        this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
      } else if (this.principal.details.authentication === true) {
        this.getMenus();
      } else {
        this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
      }

      localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_PLUGIN_SERVICE_NAME, JSON.stringify(data.pluginServices));

      this.saveDeviceIdentified(r);

      let _this = this;

      let offset = _this.$dayjs(r.data.timestamp).valueOf() - Date.now();
      _this.$dayjs.now = function() { return _this.$dayjs(Date.now() + offset); }

      if (data.semesterComplete) {
        let semesterCompleteMonthDay = _this.$dayjs(_this.$dayjs.now().year() + "-" + data.semesterComplete);
        this.$store.commit(LOCALE_MUTATION_TYPE.SET_SEMESTER_COMPLETE_DAY, semesterCompleteMonthDay);
      }
    },
    menuOpen(keys) {
      this.menu.openKeys = keys.filter(key => this.menu.openKeys.indexOf(key) === -1);
    },
    toggleCollapsed() {
      this.menu.collapsed = !this.menu.collapsed;
      localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_MENU_COLLAPSED_NAME, this.menu.collapsed);
    },
    logout() {
      localStorage.clear();
      this.$router.push(process.env.VUE_APP_LOGIN_PAGE);
    },
    storageMenusAndRedirect(response) {

      let details = JSON.parse(JSON.stringify(this.principal.details));
      details.menus = response.data.data;

      this.$store.commit(PRINCIPAL_MUTATION_TYPE.SET_PRINCIPAL, details);
      this.spinning = false;

      let requestPath = sessionStorage.getItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME);
      if (requestPath !== null) {
        this.$router.push(requestPath);
        sessionStorage.removeItem(process.env.VUE_APP_SESSION_STORAGE_REQUEST_PATH_NAME);
      }

    },
    getMenus() {
      if (this.principal.details.menus.length === 0) {
        this.spinning = true;
        this.$http
            .get("/api/authentication/resource/getConsolePrincipalResources", {
              params: {
                type: "Menu",
                mergeTree: true
              }
            })
            .then(this.storageMenusAndRedirect);
      }
    },
  },
  watch: {
    $route(r) {
      this.menu.selectedKeys = [r.query.selectMenu ? r.query.selectMenu : (r.meta.selectMenu || r.path)];
      this.menu.openKeys = [r.meta.parent];
    }
  },
  data() {
    return {
      isRouterAlive:true,
      screenWidth: document.body.clientWidth,
      siteMessage:{
        link:{
          "workflow.apply":"workflow_apply_detail",
          "authentication.info":"authentication_info_detail"
        },
        defaultDataSource:{
          elements:[],
          first:true,
          last:true,
          number:1,
          size:Math.abs(window.screen.height / 73).toFixed(0)
        },
        dataSource:{},
        activeKey:undefined,
        visible:false,
        tabs:[],
        icon:{
          "10":"icon-site-message-10",
          "20":"icon-site-message-20",
          "30":"icon-site-message-30",
          "40":"icon-site-message-40",
        },
        searchText:''
      },
      spinning: false,
      chatVisible:false,
      menu: {
        collapsed: document.body.clientWidth <= 768,
        selectedKeys:[this.$route.query.selectMenu ? this.$route.query.selectMenu : (this.$route.meta.selectMenu || this.$route.path)],
        openKeys:[this.$route.meta.parent]
      }
    }
  }
}
</script>