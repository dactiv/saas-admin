<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-dictionary" /> 数据字典管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="数据字典管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-dictionary" />
      </template>

      <a-input v-model:value="form['filter_[code_like]']" placeholder="请输入名称进行查询" @pressEnter="this.search(1,$event)" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button size="small" type="text" @click="search()" :loading="this.loading">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span>搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-dropdown size="small" type="text" placement="bottomLeft">

            <template #overlay>
              <a-menu @click="handleMenuClick" >
                <a-menu-item key="add" :disabled="!this.principal.hasPermission('perms[dictionary_type:save]')">
                  <a-space>
                    <icon-font class="icon" type="icon-add" />
                    添加
                  </a-space>
                </a-menu-item>
                <a-menu-item key="delete" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[dictionary_type:delete]')">
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

      <a-table :loading="this.loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: selectedIds, onChange: selectChange}" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.data" :columns="this.columns" bordered>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <template v-if="record.remark">
              <a-tooltip :title="record.remark">
                <a-typography-text type="warning">
                  <icon-font class="icon" type="icon-help"/>
                </a-typography-text>
              </a-tooltip>
              {{record.name}}
            </template>
            <template v-else>
              {{record.name}}
            </template>
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomRight">

                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="addChildren" :disabled="!this.principal.hasPermission('perms[dictionary_type:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-tree-table" />
                        添加子类
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="add" :disabled="!this.principal.hasPermission('perms[dictionary_type:get]')">
                      <a-space>
                        <icon-font class="icon" type="icon-edit" />
                        编辑
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[dictionary_type:delete]')">
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
    </a-card>
  </div>
</template>

<script>

export default {
  name:"AdminDictionaryIndex",
  data() {
    return {
      form: {
        "filter_[code_like]":"",
        "mergeTree":true
      },
      columns:[
        {
          title: "代码",
          dataIndex: "code",
          ellipsis: true,
          width: 300
        },{
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 150
        },{
          title: "操作",
          align: "center",
          key:"action",
          fixed: "right",
          width: 100
        }
      ],
      selectedIds:[],
      data: [],
      loading:false
    }
  },
  created() {
    this.search();
  },
  methods:{
    handleMenuClick(e, record) {
      if (e.key === 'delete') {
        if (record) {
          this.confirm("确定要删除" + record.name + "字典类型吗?", () => this.remove([record.id]));
        } else if (this.selectedIds.length > 0){
          this.confirm("确定要删除" + this.selectedIds.length + "条记录吗?", () => this.remove(this.selectedIds));
        }
      } else if (e.key === 'add' || e.key === 'edit')  {
        this.edit(record);
      } else if (e.key === "addChildren") {
        this.edit(undefined, record);
      }
    },
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    edit(record, parentRecord) {

      let to = {
        name: "config_dictionary_type_edit",
        query:{}
      }

      if (parentRecord) {
        to.query.parentId = parentRecord.id;
      }

      if (record !== undefined) {
        to.query.id = record.id;
      }

      this.$router.push(to);

    },
    remove(ids) {
        this.loading = true;
        this
            .$http
            .post("/api/admin/dictionary/deleteDictionaryType",this.formUrlEncoded({ids:ids})).then((r) => {
              this.$message.success(r.data.message);
              this.selectedIds = [];
              this.search();
            })
            .catch(() => this.loading = false);

    },
    search() {

      this.loading = true;

      this
          .$http
          .post("/api/admin/dictionary/findDictionaryType",this.formUrlEncoded(this.form))
          .then(r => {
            this.data = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>