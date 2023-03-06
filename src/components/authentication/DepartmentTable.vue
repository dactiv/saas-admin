<template>

  <a-table :loading="this.loading" class="ant-table-striped" :expandedRowKeys="this.expandedRowKeys" @expand="onExpand" :row-selection="{ selectedRowKeys: this.tableSelectedIds, onChange: this.selectChange, getCheckboxProps}" :rowKey="getRowKey" :scroll="this.scroll" :pagination="false" :data-source="this.dataSource" :columns="this.columns" bordered>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <template v-if="this.searchData.loadUser">
          <template v-if="record.recordType === 'department'">
            <a-space>
              <template v-if="record.remark">
                <a-tooltip :title="record.remark">
                  <a-typography-text type="warning">
                    <icon-font class="icon" type="icon-help"/>
                  </a-typography-text>
                </a-tooltip>
                {{record.name + '(' + record.count + ')'}}
              </template>
              <template v-else>
                {{record.name + '(' + record.count + ')'}}
              </template>
              <a-tag color="success">
                {{ record.type.name }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="record.recordType === 'person'">
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + record.userType + '/' + record.userId + '/current&date=' + this.$dayjs().unix()" /> <span>{{ record.username}}</span>
            </a-space>
          </template>
        </template>
        <template v-else>
          {{record.name + '(' + record.count + ')'}}
        </template>
      </template>
      <template v-if="column.key === 'action'">
        <div class="text-center" >
          <a-dropdown size="small" placement="bottomRight" v-if="!this.searchData.loadUser || (record.recordType === 'department')">
            <template #overlay>
              <a-menu @click="handleMenuClick($event, record)" >
                <a-menu-item key="addChildren" :disabled="!this.principal.hasPermission('perms[department:get]')">
                  <a-space>
                    <icon-font class="icon" type="icon-tree-table" />
                    添加子类
                  </a-space>
                </a-menu-item>
                <a-menu-item key="edit" :disabled="!this.principal.hasPermission('perms[department:get]')">
                  <a-space>
                    <icon-font class="icon" type="icon-edit" />
                    编辑
                  </a-space>
                </a-menu-item>
                <a-menu-item key="remove" :disabled="!this.principal.hasPermission('perms[department:delete]')">
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
          <a-button size="small" type="primary" v-if="record.recordType === 'person'" @click="removeUser(record)" danger>
            <icon-font class="icon" type="icon-close" />
            移除
          </a-button>
        </div>
      </template>
    </template>

  </a-table>

</template>

<script>
export default {
  name:"AuthenticationDepartmentTable",
  props:{
    searchData:{
      type:Object,
      default() {
        return {};
      },
    },
    chooseYourself: {
      type:Boolean,
      default:false,
    },
    searchText:{
      type:String,
      default:""
    },
    scroll:{
      type:Object,
      default() {
        return { x: 715 };
      },
    },
    checkboxProps:{
      type:Function,
      default() {
        return {disabled:false};
      }
    },
    createdSearch:{
      type:Boolean,
      default:false,
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
      columns:[
        {
          title: "名称",
          key: "name",
          ellipsis: true,
          width: 500
        },{
          title: "操作",
          align: "center",
          key: "action",
          fixed: "right",
          width: 110
        }
      ],
      tableSelectedIds:this.selectedIds,
      expandedRowKeys:[],
      loadDataSourceExpandedRowKeys:[],
      dataSource: [],
      loadDataSource:[],
      searchDataSource:[],
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
        this.expandedRowKeys.push(this.getRowKey(record));
      } else {
        let index = this.expandedRowKeys.indexOf(this.getRowKey(record));
        this.expandedRowKeys.splice(index, 1);
      }
    },
    handleMenuClick(e, record) {
      if (e.key === "edit") {
        this.edit(record)
      } else if (e.key === "remove") {
        this.confirm("确定删除 [" + record.name + "] 吗？", () => this.remove(record));
      } else if (e.key === "addChildren") {
        this.edit(undefined, record);
      }
    },
    getCheckboxProps(r) {
      return this.checkboxProps(r);
    },
    getRowKey(record) {
      if (this.searchData.loadUser) {
        if (record.recordType === 'department') {
          return 'department-' + record.id
        } else {
          return 'person-' + record.userId + '-' + record.userType;
        }
      } else {
        return record.id;
      }
    },
    filterData() {
      this.loading = true;
      this.$emit('searching');
      this.loadDataSourceExpandedRowKeys = this.expandedRowKeys;
      if (this.searchText === "") {
        this.dataSource = JSON.parse(JSON.stringify(this.loadDataSource));
        this.expandedRowKeys = this.loadDataSourceExpandedRowKeys;
      } else {
        let temp = JSON.parse(JSON.stringify(this.loadDataSource));
        this.searchDataSource = this.filterDataSource(this.searchText, temp, ["name","username"]);
        if (this.searchDataSource.length > 0) {
          this.dataSource = this.searchDataSource;
          this.expandedRowKeys = this.getDataSourceKey(this.dataSource);
        }
      }

      this.loading = false;
      this.$emit('search');
    },
    removeUser(record) {
      this.confirm('确定要删除 [' + record.username + '] 成员吗?',() => {
        this.loading = true;
        this
            .$http
            .post("/api/authentication/department/removeUser",this.formUrlEncoded({id:record.parentId, userIds:[record.userId]})).then((r) => {
              this.$message.success(r.data.message);
              this.search();
            })
            .catch(() => this.loading = false);
      });
    },
    edit(record, parentRecord) {

      let to = {
        name: "authentication_department_edit",
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
    selectChange(selectedIds) {
      this.tableSelectedIds = selectedIds;
      this.$emit("update:selectedIds", this.tableSelectedIds);
    },
    getSelectedRecords() {
      if (this.searchData.loadUser) {
        let ids = this.tableSelectedIds.filter(id => id.indexOf("department") >= 0).map(id => id.substring(id.indexOf("-") + 1, id.length) * 1);
        return ids.map(id => this.findRecordByPersonId(id));
      }
      return this.tableSelectedIds.map(id => this.findRecordById(id));
    },
    getSelectedPersonRecords() {
      if (!this.searchData.loadUser) {
        return [];
      }
      let ids = this.tableSelectedIds.filter(id => id.indexOf("person") >= 0).map(id => id.substring(id.indexOf("-") + 1, id.length));
      return ids.map(id => this.findRecordByPersonId(id));
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
    findRecordByPersonId(id) {
      let array = id.split("-");
      let userId = array[0] * 1;
      let userType = array[1];
      for (let i = 0; i < this.dataSource.length; i++) {
        let r = this.dataSource[i];
        if (r.userId === userId && r.userType === userType) {
          return r;
        } else if (r.children) {
          r = this.getPersonRecordById(id, r.children);
          if (r) {
            return r;
          }
        }
      }
    },
    getPersonRecordById(id, data) {
      let array = id.split("-");
      let userId = array[0] * 1;
      let userType = array[1];
      for (let i = 0; i < data.length; i++) {
        let r = data[i];
        if (r.userId === userId && r.userType === userType) {
          return r;
        } else if (r.children) {
          r = this.getPersonRecordById(id, r.children);
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
        if (this.searchData.loadUser) {
          ids = this.tableSelectedIds.filter(id => id.indexOf("department") >= 0).map(id => id.substring(id.indexOf("-") + 1, id.length - 1));
        } else {
          ids = this.tableSelectedIds
        }
      }
      this.loading = true;
      this
          .$http
          .post("/api/authentication/department/delete",this.formUrlEncoded({ids:ids})).then((r) => {
            this.$message.success(r.data.message);
            this.tableSelectedIds = [];
            this.$emit("update:selectedIds", this.tableSelectedIds);
            this.search();
          })
          .catch(() => this.loading = false);
    },
    mergePerson(data) {
      data.forEach(d => {
        d.recordType = "department"
        if (d.children) {
          this.mergePerson(d.children);
        }

        if (d.personList) {
          d.children = d.children || [];
          let personData = d.personList;
          if (this.principal.details && !this.chooseYourself) {
            personData = d.personList.filter(p => p.userId !== this.principal.details.id || p.userType !== this.principal.details.type)
          }
          personData.forEach(p => {
            p.recordType = "person";
            p.parentId = d.id;
          });
          d.children.push(...personData);

        }
      });
    },
    getDataSourceKey(dataSource) {
      let result = [];
      dataSource.forEach(record => {
        result.push(this.getRowKey(record));
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
          .post("/api/authentication/department/find",this.formUrlEncoded(form))
          .then(r => {
            this.loadDataSource = r.data.data || [];
            if (this.searchData.loadUser) {
              this.mergePerson(this.loadDataSource);
            }
            this.dataSource = this.loadDataSource;
            this.loading = false;
            this.$emit('search');
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>