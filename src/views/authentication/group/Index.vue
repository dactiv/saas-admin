<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-authority" /> 权限管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-group" /> 组管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="角色管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-group" />
      </template>

      <a-input v-model:value="this.searchText" @pressEnter="this.$refs['group-table'].filter()" placeholder="请输入名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="$refs['group-table'].filter()" :loading="this.loading">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-dropdown size="small" type="text" placement="bottomLeft">

            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="add" :disabled="!this.principal.hasPermission('perms[group:save]')">
                  <a-space>
                    <icon-font class="icon" type="icon-add" />
                    添加
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[group:delete]')">
                  <a-space>
                    <icon-font class="icon" type="icon-ashbin" />
                    删除选中({{this.selectedIds.length}})
                  </a-space>
                </a-menu-item>
              </a-menu>
            </template>
            <a-button size="small" type="text">
              <icon-font class="icon" type="icon-setting"/>
              操作
            </a-button>
          </a-dropdown>
        </template>
      </a-input>

      <group-table ref="group-table" :search-data="{mergeTree:true}" :search-text="this.searchText" :created-search="true" @searching="this.loading=true" @search="this.loading=false" v-model:selected-ids="this.selectedIds" />

    </a-card>
  </div>
</template>

<script>

import GroupTable from '@/components/authentication/GroupTable';

export default {
  name:"AuthenticationGroupIndex",
  components: {GroupTable},
  data() {
    return {
      selectedIds:[],
      loading:false,
      searchText:""
    }
  },
  methods: {
    handleMenuClick(e) {
      if (e.key === "add") {
        this.$refs['group-table'].edit();
      } else if (e.key === "delete") {
        this.confirm("确定删除 " + this.selectedIds.length + " 条记录吗?'", () => this.$refs['group-table'].remove(null))
      }
    },
  }
}

</script>