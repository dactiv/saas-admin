<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-crypto-currency-bitcoin-imac" /> 访问加解密</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="访问加解密" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-crypto-currency-bitcoin-imac" />
      </template>

      <a-spin :spinning="this.spinning">

        <a-input v-model:value="this.form['filter_[name_like]']" @pressEnter="this.search" placeholder="请输入名称进行查询" class="margin-lg-bottom">
          <template #addonAfter>
            <a-dropdown-button type="text" size="small" @click="this.search" :loading="this.spinning">
              <icon-font class="icon" v-if="!this.spinning" type="icon-search" />
              <span class="hidden-xs hidden-sm hidden-md">搜索</span>
              <template #overlay>
                <a-menu @click="this.searchDialogVisible = true;">
                  <a-menu-item key="searchModel">
                    <icon-font class="icon" type="icon-filter" />
                    <span class="hidden-xs hidden-sm hidden-md">
                    高级搜索
                  </span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown-button>
          </template>
          <template #addonBefore>
            <a-dropdown size="small" type="text" placement="bottomLeft">

              <template #overlay>
                <a-menu @click="handleMenuClick" >
                  <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[access_crypto:get]')">
                    <a-space>
                      <icon-font class="icon" type="icon-add" />
                      添加
                    </a-space>
                  </a-menu-item>
                  <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[access_crypto:delete]')">
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

        <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: this.selectedIds, onChange:this.selectChange }" :rowKey="record=>record.id" :scroll="{ x: 1120 }" :pagination="false" :data-source="page.elements" :columns="columns" bordered>

          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'requestDecrypt'">
              {{record.requestDecrypt.name}}
            </template>
            <template v-if="column.dataIndex === 'responseEncrypt'">
              {{record.responseEncrypt.name}}
            </template>
            <template v-if="column.dataIndex === 'enabled'">
              {{record.enabled.name}}
            </template>
            <template v-if="column.key === 'action'">
              <div class="text-center">
                <a-dropdown size="small" type="text" placement="bottomLeft">
                  <template #overlay>
                    <a-menu @click="handleMenuClick($event, record)" >
                      <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[access_crypto:get]')">
                        <a-space>
                          <icon-font class="icon" type="icon-edit" />
                          编辑
                        </a-space>
                      </a-menu-item>
                      <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[access_crypto:delete]')">
                        <a-space>
                          <icon-font class="icon" type="icon-ashbin" />
                          删除
                        </a-space>
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button size="small">
                    <icon-font class="icon" type="icon-setting"/>
                    操作
                  </a-button>
                </a-dropdown>
              </div>
            </template>
          </template>

        </a-table>

        <div class="margin-md-top text-right" >

          <a-space :size="10">
            <span class="hidden-xs">每页</span>
            <a-input v-model:value="page.size" size="small" @pressEnter="search" :maxlength="4" class="text-center hidden-xs" style="width: 50px" />
            <span class="hidden-xs">条 / 第 1 页</span>
            <a-button size="small" @click="search(page.number - 1)" :disabled="this.page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
            {{this.page.number}}
            <a-button size="small" @click="search(page.number + 1)" :disabled="this.page.last"><icon-font type="icon-arrow-right-bold" /></a-button>

          </a-space>

        </div>

      </a-spin>
    </a-card>

    <a-modal v-model:visible="searchDialogVisible" width="600px" title="查询访问加解密" @ok="search(null)" layout="vertical">
      <a-form ref="search-form" :model="form" layout="vertical">

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="名称:">
              <a-input v-model:value="form['filter_[name_like]']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型:">
              <a-input v-model:value="form['filter_[real_type_eq]']" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="12">
            <a-form-item label="值:">
              <a-input v-model:value="form['filter_[value_like]']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态:">
              <a-select v-model:value="form['filter_[status_eq]']">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option v-for="(value, name) of statusOptions" :key="value" :value="value">
                  {{name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-modal>
  </div>
</template>

<script>

export default {
  name:"ConfigCryptoIndex",
  data() {
    return {
      columns:[
        {
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 200
        },
        {
          title: "拦截值",
          dataIndex: "value",
          ellipsis: true,
          width: 200
        },
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 120
        },{
          title: "请求加密",
          dataIndex: "requestDecrypt",
          ellipsis: true,
          width: 150
        },{
          title: "响应加密",
          dataIndex: "responseEncrypt",
          ellipsis: true,
          width: 150
        },{
          title: "状态",
          dataIndex: "enabled",
          ellipsis: true,
          width: 80
        },{
          title: "备注",
          dataIndex: "remark",
          ellipsis: true,
          width: 320
        },{
          title: "操作",
          fixed: "right",
          width: 175,
          key: "action"
        }
      ],
      selectedIds:[],
      form:{
        "filter_[name_like]":"",
        "filter_[type_eq]":"",
        "filter_[value_like]":"",
        "filter_[status_eq]":""
      },
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      spinning: false,
      statusOptions:[],
      searchDialogVisible: false
    }
  },
  created() {
    this.queryConfigDictionary({service:"config", enumerateName:"DisabledOrEnabled"}).then(r=> this.statusOptions = r.data.data);
    this.search();
  },
  methods:{
    edit(record) {

      let to = {
        name: "config_access_crypto_edit"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    handleMenuClick(e, record) {
      if (e.key === "edit") {
        this.edit(record);
      } else if (e.key === "delete") {
        if (record) {
          this.confirm("确定要删除 [" + record.name + "] 吗?", () => this.remove([record.id]));
        } else {
          this.confirm("确定要删除 " + this.selectedIds.length + " 条记录吗?", () => this.remove(this.selectedIds));
        }
      }
    },
    remove(ids) {

      this.spinning = true;

      this
          .$http
          .post("/api/admin/access/crypto/delete",this.formUrlEncoded({ids:ids})).then((r) => {
            this.$message.success(r.data.message);
            this.selectedIds = [];
            this.search();
          })
          .catch(() => this.spinning = false);

    },
    search(number) {

      this.spinning = true;

      this.searchDialogVisible = false;

      let param = this.form;

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this
          .$http
          .post("/api/admin/access/crypto/page",this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.spinning = false;
          })
          .catch(() => this.spinning = false);
    }
  }
}

</script>