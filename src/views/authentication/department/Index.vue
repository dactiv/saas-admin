<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-group" /> 部门管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="部门管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-group" />
      </template>

      <a-input v-model:value="this.searchText" @pressEnter="this.$refs['department-table'].filterData()" placeholder="请输入名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="this.$refs['department-table'].filterData()" :loading="this.loading">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-dropdown size="small" type="text" placement="bottomLeft">

            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="add" :disabled="!this.principal.hasPermission('perms[department:save]')">
                  <a-space>
                    <icon-font class="icon" type="icon-add" />
                    添加
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[department:delete]')">
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

      <department-table ref="department-table" :checkbox-props="getCheckboxProps" :search-text="this.searchText" :searchData="this.form" @searching="this.loading=true" @search="this.loading=false" :created-search="true" v-model:selected-ids="selectedIds"/>

    </a-card>
  </div>
</template>

<script>

import DepartmentTable from '@/components/authentication/DepartmentTable';

export default {
  name:"AuthenticationDepartmentIndex",
  components: {DepartmentTable},
  data() {
    return {
      selectedIds:[],
      loading:false,
      searchText:"",
      form:{
        "mergeTree":true,
        "loadUser":true
      }
    }
  },
  methods: {
    handleMenuClick(e) {
      if (e.key === "add") {
        this.$refs['department-table'].edit();
      } else if (e.key === "delete") {
        this.confirm("确定删除 " + this.selectedIds.length + " 条记录吗?'", () => this.$refs['department-table'].remove(null))
      }
    },
    getCheckboxProps(r) {
      return {disabled:r.recordType === 'person'}
    }
  }
}

</script>