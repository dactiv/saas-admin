<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-authority" /> 权限管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-attachment" /> 資源管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="資源管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-attachment" />
      </template>

      <a-input v-model:value="this.searchText" @pressEnter="this.$refs['resource-table'].filter()"  placeholder="请输入名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="$refs['resource-table'].filter()" :loading="this.loading">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-button type="text" size="small" :loading="this.loading" @click="syncResource" v-if="this.principal.hasPermission('perms[resource:sync_plugin_resource]')">
            <icon-font class="icon" v-if="!this.loading" type="icon-history"/>
            <span class="hidden-xs hidden-sm hidden-md">同步資源</span>
          </a-button>
        </template>
      </a-input>

      <resource-table ref="resource-table" @searching="loading=true" @search="loading=false" :search-text="this.searchText" :created-search="true" :search-data="{mergeTree:true}"/>

    </a-card>
  </div>
</template>

<script>

import ResourceTable from "@/components/authentication/ResourceTable";

export default {
  name:"AuthenticationResourceIndex",
  components: {ResourceTable},
  data() {
    return {
      loading:false,
      searchText:""
    }
  },
  methods:{
    syncResource() {
      this.loading = true;

      this
          .$http
          .post("/api/authentication/resource/syncPluginResource")
          .then(r => {
            this.loading = false;
            this.$message.success(r.data.message);
          })
          .catch(() => this.loading = false);

    }
  }
}

</script>