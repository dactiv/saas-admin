<template>

  <a-table :loading="this.loading" class="ant-table-striped" :expandedRowKeys="this.expandedRowKeys" @expand="onExpand" :row-selection="{ selectedRowKeys: tableSelectedIds, onChange: selectChange, getCheckboxProps: disabledCheckbox}" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.dataSource" :columns="this.columns" bordered>

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
      <template v-if="column.dataIndex === 'sources'">
        <a-space>
          <a-tag v-for="name of record.sources" :key="name.name" color="success">
            {{ name.name }}
          </a-tag>
        </a-space>
      </template>

      <template v-if="column.key === 'action'">
        <div class="text-center">
          <a-dropdown size="small" placement="bottomRight">
            <template #overlay>
              <a-menu @click="handleMenuClick($event, record)" >
                <a-menu-item key="addChildren" :disabled="!this.principal.hasPermission('perms[group:get]')">
                  <a-space>
                    <icon-font class="icon" type="icon-tree-table" />
                    添加子类
                  </a-space>
                </a-menu-item>
                <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[group:get]')">
                  <a-space>
                    <icon-font class="icon" type="icon-edit" />
                    编辑
                  </a-space>
                </a-menu-item>
                <a-menu-item key="remove" :disabled="!this.principal.hasPermission('perms[group:delete]')">
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

</template>

<script>
export default {
  name:"AuthenticationGroupTable",
  props:{
    searchData:{
      type:Object,
      default() {
        return {};
      },
    },
    createdSearch:{
      type:Boolean,
      default:false,
    },
    searchText:{
      type:String,
      default:""
    },
    selectedIds:{
      type:Array,
      default:function() {
        return [];
      }
    }
  },
  emits: ["searching", "search", "update:selectedIds"],
  data() {
    return {
      tableSelectedIds:this.selectedIds,
      columns:[
        {
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 150
        },
        {
          title: "权限名",
          dataIndex: "authority",
          ellipsis: true,
          width: 130
        },
        {
          title: "来源",
          dataIndex: "sources",
          ellipsis: true,
          width: 320
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key:"action",
          width: 110
        }
      ],
      dataSource: [],
      loadDataSource:[],
      searchDataSource:[],
      expandedRowKeys:[],
      loadDataSourceExpandedRowKeys:[],
      loading:false
    }
  },
  watch:{
    selectedIds() {
      this.tableSelectedIds = this.selectedIds;
    }
  },
  created() {
    if (this.createdSearch) {
      this.search();
    }
  },
  methods:{
    onExpand(expanded, record) {
      if (expanded) {
        this.expandedRowKeys.push(record.id);
      } else {
        let index = this.expandedRowKeys.indexOf(record.id);
        this.expandedRowKeys.splice(index, 1);
      }
    },
    handleMenuClick(e, record) {
      if (e.key === "edit") {
        this.edit(record)
      } else if (e.key === "remove") {
        this.confirm("确定删除 [" + record.name + "] 组吗？", () => this.remove(record));
      } else if (e.key === "addChildren") {
        this.edit(undefined, record);
      }
    },
    edit(record, parentRecord) {

      let to = {
        name: "authentication_group_edit",
        query:{}
      }

      if (parentRecord) {
        to.query.parentId = parentRecord.id;
      }

      if (record) {
        to.query.id = record.id;
      }

      this.$router.push(to);

    },
    disabledCheckbox(r) {
      return {disabled: r.removable.value !== 1 && !this.enableCheckbox}
    },
    selectChange(selectedIds) {
      this.tableSelectedIds = selectedIds;
      this.$emit("update:selectedIds", this.tableSelectedIds);
    },
    getSelectedRecords() {
      return this.tableSelectedIds.map(id => this.findRecordById(id));
    },
    findRecordById(id) {
      for (let i = 0; i < this.dataSource.length; i++) {
        let r = this.dataSource[i];
        if (r.id === id) {
          return r;
        } else if (r.children) {
          r = this.getRecordById(id, r.children);
          if (r) {
            return r;
          }
        }
      }
    },
    getRecordById(id, data) {
      for (let i = 0; i < data.length; i++) {
        let r = data[i];
        if (r.id === id) {
          return r;
        } else if (r.children) {
          r = this.getRecordById(id, r.children);
          if (r) {
            return r;
          }
        }
      }
    },
    remove(record) {

      let ids = [];
      if (record) {
        ids.push(record.id);
      } else {
        ids = this.tableSelectedIds;
      }
      this.loading = true;
      this
          .$http
          .post("/api/authentication/group/delete",this.formUrlEncoded({ids:ids})).then((r) => {
            this.$message.success(r.data.message);
            this.tableSelectedIds = [];
            this.$emit("update:selectedIds", this.tableSelectedIds);
            this.search();
          })
          .catch(() => this.loading = false);

    },
    filter() {
      this.loading = true;
      this.$emit('searching');
      if (this.searchText === "") {
        this.dataSource = JSON.parse(JSON.stringify(this.loadDataSource));
        this.loadDataSourceExpandedRowKeys = this.expandedRowKeys;
      } else {
        let temp = JSON.parse(JSON.stringify(this.loadDataSource));
        this.searchDataSource = this.filterDataSource(this.searchText, temp, ["name"]);
        if (this.searchDataSource.length > 0) {
          this.dataSource = this.searchDataSource;
          this.expandedRowKeys = this.getDataSourceKey(this.dataSource);
        }
      }

      this.loading = false;
      this.$emit('search');
    },
    getDataSourceKey(dataSource) {
      let result = [];
      dataSource.forEach(record => {
        result.push(record.id);
        if (record.children) {
          let children = this.getDataSourceKey(record.children);
          result.push(...children);
        }
      });

      return result;
    },
    search(form) {

      this.loading = true;
      this.$emit('searching');

      if (!form) {
        form = this.searchData;
      }

      this
          .$http
          .post("/api/authentication/group/find",this.formUrlEncoded(form))
          .then(r => {
            this.loadDataSource = r.data.data || [];
            this.dataSource = this.loadDataSource;
            this.loading = false;
            this.$emit('search');
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>