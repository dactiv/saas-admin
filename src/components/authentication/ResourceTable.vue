<template>

  <a-table :loading="this.loading" class="ant-table-striped" :expandedRowKeys="this.expandedRowKeys" @expand="onExpand" :row-selection="this.selection ? { selectedRowKeys: tableSelectedIds, onSelect: select, onSelectAll:selectAll} : undefined" :rowKey="record=>record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.dataSource" :columns="this.columns" bordered>
    <template #bodyCell="{column, record}">
      <template v-if="column.dataIndex === 'name'">
        <a-space>
          <icon-font class="icon" :type="!record.icon ? 'icon-unkown' : record.icon" />
          <span>{{record.name}} </span>
        </a-space>
      </template>
      <template v-if="column.dataIndex === 'sources'">
        <a-space>
          <a-tag v-for="s of record.sources" :key="s.name" color="success">
            {{ s.name }}
          </a-tag>
        </a-space>
      </template>
      <template v-if="column.dataIndex === 'type'">
        {{record.type.value}}
      </template>
      <template v-if="column.key === 'action'">
        <div class="text-center">
          <a-space>
            <a-button size="small" @click="detail(record)" v-if="this.principal.hasPermission('perms[resource:get]')">
              <icon-font class="icon" type="icon-file"/>
              <span class="hidden-xs hidden-sm hidden-md">详情</span>
            </a-button>
          </a-space>
        </div>
      </template>
    </template>

  </a-table>

</template>

<script>
export default {
  name:"AuthenticationResourceTable",
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
    },
    selection:{
      type:Boolean,
      default() {
        return false
      }
    }
  },
  emits: ['searching', 'search', "update:selectedIds"],
  data() {
    return {
      columns:[
        {
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 300
        },{
          title: "来源",
          dataIndex: "sources",
          ellipsis: true,
          width: 260
        },{
          title: "資源值",
          dataIndex: "value",
          ellipsis: true,
          width: 180
        },{
          title: "資源类型",
          dataIndex: "type",
          ellipsis: true,
          width: 150
        },{
          title: "权限值",
          dataIndex: "authority",
          ellipsis: true,
          width: 150
        },{
          title: "操作",
          align: "center",
          key: "action",
          fixed: "right",
          width: 100
        }
      ],
      tableSelectedIds:this.selectedIds,
      expandedRowKeys:[],
      loadDataSourceExpandedRowKeys:[],
      dataSource: [],
      loadDataSource: [],
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
      this.search(this.searchData);
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
    selectAll(selected, selectedRows) {
      this.tableSelectedIds = selectedRows.filter(s => s !== undefined).map(s => s.id);
      this.$emit("update:selectedIds", this.tableSelectedIds);
    },
    select(record, selected) {
      if (selected) {
        let parentIds = this.getParentIds(record);
        this.tableSelectedIds.push(...parentIds)
        this.tableSelectedIds.push(record.id);
        let childrenIds = this.getChildrenIds(record);
        this.tableSelectedIds.push(...childrenIds);
      } else {
        this.tableSelectedIds.splice(this.tableSelectedIds.indexOf(record.id), 1)
        let childrenIds = this.getChildrenIds(record);
        childrenIds.forEach(c => this.tableSelectedIds.splice(this.tableSelectedIds.findIndex(i => i === c), 1));
      }
      this.$emit("update:selectedIds", this.tableSelectedIds);
    },
    getSelectedRecords() {
      return this.tableSelectedIds.map(id => this.getRecordById(id, this.dataSource)).filter(r => r !== undefined);
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
    getParentIds(record) {
      let result = [];
      if (!record.parentId) {
        return result
      }

      let parent = this.getRecordById(record.parentId, this.dataSource);
      if (parent) {
        let parentIds = this.getParentIds(parent);
        parentIds.filter(p => !result.includes(p)).forEach(p => result.push(p));
      }

      if (!result.includes(record.parentId)) {
        result.push(record.parentId);
      }

      return result;
    },
    getChildrenIds(record) {

      let result = [];
      if (record.children) {
        for (let i = 0; i < record.children.length; i++) {
          let c = record.children[i];
          result.push(c.id);

          let ids = this.getChildrenIds(c);
          result.push(...ids);
        }
      }

      return result;

    },
    detail(record) {

      let to = {
        name: "authentication_resource_detail"
      }

      if (record !== undefined) {
        to["query"] = {id:record.id};
      }

      this.$router.push(to);

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
          .post("/api/authentication/resource/find",this.formUrlEncoded(form))
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